BEGIN;
CREATE TABLE public.bar_operation_receipts (
 request_id uuid PRIMARY KEY, actor_id uuid NOT NULL, tab_id uuid NOT NULL,
 operation text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bar_operation_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bar_operation_receipts FROM anon, authenticated;
ALTER TABLE public.pos_tab_items ADD COLUMN stock_source_id uuid REFERENCES public.pos_items(id) ON DELETE SET NULL;
ALTER TABLE public.pos_tab_items ADD COLUMN stock_units integer;
-- Snapshot the current stock mapping for existing lines. Future sales preserve
-- the mapping even when a menu item's bottle yield changes.
UPDATE public.pos_tab_items l SET stock_source_id = COALESCE(i.bottle_parent_id,i.id),
 stock_units=CASE WHEN i.bottle_parent_id IS NULL THEN 1 ELSE p.bottle_yield END
 FROM public.pos_items i LEFT JOIN public.pos_items p ON p.id=i.bottle_parent_id WHERE l.pos_item_id=i.id;

CREATE FUNCTION public.bar_apply_operation(p_request_id uuid, p_actor uuid, p_tab_id uuid, p_operation text, p_payload jsonb DEFAULT '{}')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.pos_tabs; l public.pos_tab_items; i public.pos_items; stock public.pos_items;
 receipt public.bar_operation_receipts; qty int; units int; source_id uuid; unit_cost int; price int;
BEGIN
 IF p_request_id IS NULL OR p_actor IS NULL OR p_tab_id IS NULL THEN RAISE EXCEPTION 'Missing operation identity'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_actor AND (role IN ('admin','bartender') OR is_bartender)) THEN RAISE EXCEPTION 'Staff access required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 SELECT * INTO receipt FROM public.bar_operation_receipts WHERE request_id=p_request_id;
 IF FOUND THEN
  IF receipt.actor_id<>p_actor OR receipt.tab_id<>p_tab_id OR receipt.operation<>p_operation OR receipt.payload<>p_payload THEN RAISE EXCEPTION 'Operation identifier was already used'; END IF;
  RETURN;
 END IF;
 SELECT * INTO t FROM public.pos_tabs WHERE id=p_tab_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Tab not found'; END IF;
 IF t.status NOT IN ('open','away') THEN RAISE EXCEPTION 'Tab is already closed'; END IF;
 IF p_operation NOT IN ('close','void','reopen') AND t.status<>'open' THEN RAISE EXCEPTION 'Reopen this tab first'; END IF;
 IF p_operation='add' THEN
  SELECT * INTO i FROM public.pos_items WHERE id=(p_payload->>'item_id')::uuid FOR UPDATE;
  IF NOT FOUND OR NOT i.is_active THEN RAISE EXCEPTION 'Item is no longer available'; END IF;
  source_id:=COALESCE(i.bottle_parent_id,i.id);
  SELECT * INTO stock FROM public.pos_items WHERE id=source_id FOR UPDATE;
  units:=CASE WHEN i.bottle_parent_id IS NULL THEN 1 ELSE stock.bottle_yield END;
  IF units IS NULL OR units<=0 THEN RAISE EXCEPTION 'Bottle is not set up for sale'; END IF;
  IF stock.stock_quantity IS NOT NULL AND (stock.stock_quantity<units OR (i.bottle_parent_id IS NOT NULL AND stock.stock_quantity<=units)) THEN RAISE EXCEPTION 'Not enough stock; keep the last bottle for shots'; END IF;
  UPDATE public.pos_items SET stock_quantity=stock_quantity-units WHERE id=source_id AND stock_quantity IS NOT NULL;
  unit_cost:=CASE WHEN i.bottle_parent_id IS NULL THEN i.cost_jmd ELSE stock.cost_jmd*units END;
  INSERT INTO public.pos_tab_items(tab_id,pos_item_id,name,price_jmd,cost_jmd,quantity,stock_source_id,stock_units)
  VALUES(p_tab_id,i.id,i.name,i.price_jmd,unit_cost,1,source_id,units);
 ELSIF p_operation='custom' THEN
  price:=(p_payload->>'price')::int;
  IF price IS NULL OR price<=0 THEN RAISE EXCEPTION 'Enter a positive whole-dollar amount'; END IF;
  INSERT INTO public.pos_tab_items(tab_id,name,price_jmd,quantity) VALUES(p_tab_id,left(COALESCE(NULLIF(p_payload->>'name',''),'Other'),200),price,1);
 ELSIF p_operation IN ('increment','decrement','remove') THEN
  SELECT * INTO l FROM public.pos_tab_items WHERE id=(p_payload->>'tab_item_id')::uuid AND tab_id=p_tab_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item no longer exists on this tab'; END IF;
  qty:=CASE WHEN p_operation='remove' THEN l.quantity ELSE 1 END;
  units:=COALESCE(l.stock_units,1)*qty;
  IF l.stock_source_id IS NOT NULL THEN
   SELECT * INTO stock FROM public.pos_items WHERE id=l.stock_source_id FOR UPDATE;
   IF p_operation='increment' AND stock.stock_quantity IS NOT NULL AND
    (stock.stock_quantity<units OR (l.stock_units>1 AND stock.stock_quantity<=units)) THEN RAISE EXCEPTION 'Not enough stock'; END IF;
   UPDATE public.pos_items SET stock_quantity=stock_quantity+CASE WHEN p_operation='increment' THEN -units ELSE units END
    WHERE id=l.stock_source_id AND stock_quantity IS NOT NULL;
  END IF;
  IF p_operation='increment' THEN UPDATE public.pos_tab_items SET quantity=quantity+1 WHERE id=l.id;
  ELSE
   INSERT INTO public.pos_voids(tab_id,pos_item_id,name,quantity,price_jmd,cost_jmd,reason,voided_by)
   VALUES(p_tab_id,l.pos_item_id,l.name,qty,l.price_jmd,l.cost_jmd,left(p_payload->>'reason',500),p_actor);
   IF p_operation='remove' OR l.quantity=1 THEN DELETE FROM public.pos_tab_items WHERE id=l.id;
   ELSE UPDATE public.pos_tab_items SET quantity=quantity-1 WHERE id=l.id; END IF;
  END IF;
 ELSIF p_operation='close' THEN
  IF p_payload->>'payment_method' NOT IN ('cash','comp') OR p_payload->>'payment_method' IS NULL THEN RAISE EXCEPTION 'Select a payment method'; END IF;
  price:=COALESCE((p_payload->>'tip_jmd')::int,0);
  IF price<0 THEN RAISE EXCEPTION 'Tip cannot be negative'; END IF;
  UPDATE public.pos_tabs SET status='closed',payment_method=p_payload->>'payment_method',tip_jmd=price,closed_by=p_actor,closed_at=now() WHERE id=p_tab_id;
 ELSIF p_operation='void' THEN
  FOR l IN SELECT * FROM public.pos_tab_items WHERE tab_id=p_tab_id ORDER BY stock_source_id FOR UPDATE LOOP
   UPDATE public.pos_items SET stock_quantity=stock_quantity+COALESCE(l.stock_units,1)*l.quantity WHERE id=l.stock_source_id AND stock_quantity IS NOT NULL;
   INSERT INTO public.pos_voids(tab_id,pos_item_id,name,quantity,price_jmd,cost_jmd,reason,voided_by)
    VALUES(p_tab_id,l.pos_item_id,l.name,l.quantity,l.price_jmd,l.cost_jmd,'Tab voided',p_actor);
  END LOOP;
  UPDATE public.pos_tabs SET status='voided',closed_by=p_actor,closed_at=now() WHERE id=p_tab_id;
 ELSIF p_operation='away' THEN UPDATE public.pos_tabs SET status='away' WHERE id=p_tab_id;
 ELSIF p_operation='reopen' THEN
  IF t.status<>'away' THEN RAISE EXCEPTION 'Only an away tab can be reopened'; END IF;
  UPDATE public.pos_tabs SET status='open' WHERE id=p_tab_id;
 ELSE RAISE EXCEPTION 'Unknown bar operation'; END IF;
 UPDATE public.pos_tabs SET total_jmd=(SELECT COALESCE(sum(price_jmd::bigint*quantity),0) FROM public.pos_tab_items WHERE tab_id=p_tab_id) WHERE id=p_tab_id;
 INSERT INTO public.bar_operation_receipts(request_id,actor_id,tab_id,operation,payload) VALUES(p_request_id,p_actor,p_tab_id,p_operation,p_payload);
END; $$;
REVOKE ALL ON FUNCTION public.bar_apply_operation(uuid,uuid,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bar_apply_operation(uuid,uuid,uuid,text,jsonb) TO service_role;

CREATE FUNCTION public.bar_record_purchase(p_request_id uuid,p_actor uuid,p_item_id uuid,p_qty int,p_unit_cost int,p_total_cost int,p_containers int,p_container_cost int,p_note text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result int; payload jsonb; receipt public.bar_operation_receipts;
BEGIN
 IF p_request_id IS NULL OR p_actor IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND (role IN ('admin','bartender') OR is_bartender)) THEN RAISE EXCEPTION 'Staff access required'; END IF;
 IF p_qty IS NULL OR p_qty<=0 OR p_unit_cost IS NULL OR p_unit_cost<0 OR p_total_cost IS NULL OR p_total_cost<0 THEN RAISE EXCEPTION 'Invalid stock purchase'; END IF;
 payload:=jsonb_build_object('item',p_item_id,'qty',p_qty,'unit',p_unit_cost,'total',p_total_cost,'containers',p_containers,'container_cost',p_container_cost,'note',p_note);
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 SELECT * INTO receipt FROM public.bar_operation_receipts WHERE request_id=p_request_id;
 IF FOUND THEN
  IF receipt.actor_id<>p_actor OR receipt.operation<>'purchase' OR receipt.payload<>payload THEN RAISE EXCEPTION 'Operation identifier was already used'; END IF;
  SELECT stock_quantity INTO result FROM public.pos_items WHERE id=p_item_id; RETURN result;
 END IF;
 UPDATE public.pos_items SET stock_quantity=COALESCE(stock_quantity,0)+p_qty,cost_jmd=p_unit_cost WHERE id=p_item_id RETURNING stock_quantity INTO result;
 IF NOT FOUND THEN RAISE EXCEPTION 'Item not found'; END IF;
 INSERT INTO public.pos_stock_purchases(pos_item_id,quantity_added,unit_cost_jmd,total_cost_jmd,containers,container_cost_jmd,added_by,note)
 VALUES(p_item_id,p_qty,p_unit_cost,p_total_cost,p_containers,p_container_cost,p_actor,p_note);
 INSERT INTO public.bar_operation_receipts VALUES(p_request_id,p_actor,p_item_id,'purchase',payload,now());
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.bar_record_purchase(uuid,uuid,uuid,int,int,int,int,int,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bar_record_purchase(uuid,uuid,uuid,int,int,int,int,int,text) TO service_role;
CREATE FUNCTION public.bar_open_tab(p_request_id uuid,p_actor uuid,p_name text,p_notes text,p_regular uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE receipt public.bar_operation_receipts; result uuid; payload jsonb;
BEGIN
 IF p_request_id IS NULL OR p_actor IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 200 OR length(COALESCE(p_notes,''))>2000 THEN RAISE EXCEPTION 'Invalid tab details'; END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=p_actor AND (role IN ('admin','bartender') OR (role='artist' AND is_bartender))) THEN RAISE EXCEPTION 'Staff access required'; END IF;
 payload:=jsonb_build_object('name',p_name,'notes',p_notes,'regular',p_regular);
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 SELECT * INTO receipt FROM bar_operation_receipts WHERE request_id=p_request_id;
 IF FOUND THEN
  IF receipt.actor_id<>p_actor OR receipt.operation<>'open' OR receipt.payload<>payload THEN RAISE EXCEPTION 'Operation identifier was already used'; END IF;
  RETURN receipt.tab_id;
 END IF;
 INSERT INTO pos_tabs(name,notes,regular_id,opened_by) VALUES(btrim(p_name),p_notes,p_regular,p_actor) RETURNING id INTO result;
 INSERT INTO bar_operation_receipts VALUES(p_request_id,p_actor,result,'open',payload,now());
 RETURN result;
END; $$;
CREATE FUNCTION public.bar_save_regular(p_tab uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.pos_tabs; result uuid;
BEGIN
 SELECT * INTO t FROM pos_tabs WHERE id=p_tab FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Tab not found'; END IF;
 IF t.regular_id IS NOT NULL THEN RETURN t.regular_id; END IF;
 INSERT INTO bar_regulars(name) VALUES(t.name) RETURNING id INTO result;
 UPDATE pos_tabs SET regular_id=result WHERE id=p_tab;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.bar_open_tab(uuid,uuid,text,text,uuid),public.bar_save_regular(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bar_open_tab(uuid,uuid,text,text,uuid),public.bar_save_regular(uuid) TO service_role;

GRANT ALL ON public.bar_operation_receipts TO service_role;
COMMIT;
