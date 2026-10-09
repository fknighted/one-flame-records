"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/admin/bar/items/actions";

const CATEGORIES = [
  { value: "drink",     label: "Drink" },
  { value: "beverage",  label: "Beverage" },
  { value: "food",      label: "Food" },
  { value: "snack",     label: "Snack" },
  { value: "game_time", label: "Game Time" },
];

const INPUT = "studio-field";
const LABEL = "studio-field-label";

type InitialValues = {
  id?: string;
  name?: string;
  category?: string;
  price_jmd?: number;
  cost_jmd?: number | null;
  description?: string;
  sort_order?: number;
  reorder_level?: number;
  is_active?: boolean;
  bottle_group?: string | null;
  bottle_yield?: number | null;
  menu_section?: string | null;
};

const SECTIONS = [
  { value: "",          label: "Auto (by category)" },
  { value: "rum",       label: "Rums" },
  { value: "beer",      label: "Beers" },
  { value: "other",     label: "Other Drinks" },
  { value: "cigarette", label: "Cigarettes" },
];

export default function MenuItemForm({
  action,
  initialValues = {},
  mode,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: InitialValues;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, null);

  // Stored values are already whole dollars — no conversion, no decimals.
  const defaultPrice = initialValues.price_jmd != null ? String(initialValues.price_jmd) : "";
  const defaultCost  = initialValues.cost_jmd  != null ? String(initialValues.cost_jmd)  : "";

  return (
    <form action={formAction} className="space-y-6">
      {initialValues.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state?.error && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={LABEL}>Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialValues.name ?? ""}
          placeholder="e.g. Red Stripe, Jerk Chicken Wrap"
          className={INPUT}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={LABEL}>Category *</label>
          <select
            id="category"
          name="category"
            required
            defaultValue={initialValues.category ?? "drink"}
            className={INPUT}
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price" className={LABEL}>Sale price *</label>
          <input
            id="price"
          name="price"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={defaultPrice}
            placeholder="0"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cost" className={LABEL}>Cost — what you pay, per sellable unit (optional; drives profit)</label>
        <input
          id="cost"
          name="cost"
          type="number"
          step="1"
          min="0"
          defaultValue={defaultCost}
          placeholder="0"
          className={INPUT}
        />
      </div>

      <fieldset className="studio-card space-y-4">
        <legend className="px-2 text-[14px] font-semibold text-paper">Sold by the bottle (optional — spirits only)</legend>
        <p className="studio-hint -mt-1">
          Group the shot / flask / bottle versions of one spirit together and set how many of this item come from one bottle. Leave blank for normal items.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bottle_group" className={LABEL}>Bottle group (e.g. rum)</label>
            <input
              id="bottle_group"
          name="bottle_group"
              type="text"
              defaultValue={initialValues.bottle_group ?? ""}
              placeholder="rum"
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="bottle_yield" className={LABEL}>Units per bottle (shot 16, flask 4, bottle 1)</label>
            <input
              id="bottle_yield"
          name="bottle_yield"
              type="number"
              min="1"
              defaultValue={initialValues.bottle_yield ?? ""}
              placeholder="16"
              className={INPUT}
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="menu_section" className={LABEL}>Inventory section (how it groups on the inventory page)</label>
        <select
          id="menu_section"
          name="menu_section"
          defaultValue={initialValues.menu_section ?? ""}
          className={INPUT}
        >
          {SECTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className={LABEL}>Description (optional)</label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={initialValues.description ?? ""}
          placeholder="Short description shown on POS"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="sort_order" className={LABEL}>Sort order (optional — lower numbers appear first)</label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min="0"
          defaultValue={initialValues.sort_order ?? ""}
          placeholder="0"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="reorder_level" className={LABEL}>Reorder level (optional — flagged Low on inventory when stock hits this)</label>
        <input
          id="reorder_level"
          name="reorder_level"
          type="number"
          min="0"
          defaultValue={initialValues.reorder_level ?? ""}
          placeholder="5"
          className={INPUT}
        />
      </div>

      {mode === "edit" && (
        <div>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="hidden" name="is_active" value="false" />
            <input
              name="is_active"
              type="checkbox"
              value="true"
              defaultChecked={initialValues.is_active ?? true}
              className="studio-check"
            />
            <span className="text-[15px] text-paper">Active (visible on POS)</span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Saving…" : mode === "create" ? "Add Item" : "Save Changes"}
        </button>
        <Link href="/admin/bar/items" className="studio-btn studio-btn-quiet">
          Cancel
        </Link>
      </div>
    </form>
  );
}
