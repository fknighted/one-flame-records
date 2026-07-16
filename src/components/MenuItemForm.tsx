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

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";

type InitialValues = {
  id?: string;
  name?: string;
  category?: string;
  price_cents?: number;
  cost_cents?: number | null;
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

  const defaultPrice = initialValues.price_cents != null
    ? (initialValues.price_cents / 100).toFixed(2)
    : "";
  const defaultCost = initialValues.cost_cents != null
    ? (initialValues.cost_cents / 100).toFixed(2)
    : "";

  return (
    <form action={formAction} className="space-y-6">
      {initialValues.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state?.error && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-4 py-3 text-sm text-bone">
          {state.error}
        </div>
      )}

      <div>
        <label className={LABEL}>Name *</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initialValues.name ?? ""}
          placeholder="e.g. Red Stripe, Jerk Chicken Wrap"
          className={INPUT}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Category *</label>
          <select
            name="category"
            required
            defaultValue={initialValues.category ?? "drink"}
            className={INPUT + " bg-ink"}
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Sale price *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultPrice}
            placeholder="0.00"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Cost — what you pay, per sellable unit (optional; drives profit)</label>
        <input
          name="cost"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultCost}
          placeholder="0.00"
          className={INPUT}
        />
      </div>

      <fieldset className="border border-bone/10 rounded-lg p-4 space-y-4">
        <legend className="px-2 text-xs text-bone/50">Sold by the bottle (optional — spirits only)</legend>
        <p className="text-xs text-bone/40 -mt-1">
          Group the shot / flask / bottle versions of one spirit together and set how many of this item come from one bottle. Leave blank for normal items.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Bottle group (e.g. rum)</label>
            <input
              name="bottle_group"
              type="text"
              defaultValue={initialValues.bottle_group ?? ""}
              placeholder="rum"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Units per bottle (shot 16, flask 4, bottle 1)</label>
            <input
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
        <label className={LABEL}>Inventory section (how it groups on the inventory page)</label>
        <select
          name="menu_section"
          defaultValue={initialValues.menu_section ?? ""}
          className={INPUT + " bg-ink"}
        >
          {SECTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL}>Description (optional)</label>
        <input
          name="description"
          type="text"
          defaultValue={initialValues.description ?? ""}
          placeholder="Short description shown on POS"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Sort order (optional — lower numbers appear first)</label>
        <input
          name="sort_order"
          type="number"
          min="0"
          defaultValue={initialValues.sort_order ?? ""}
          placeholder="0"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Reorder level (optional — highlights red on inventory when stock hits this)</label>
        <input
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="is_active" value="false" />
            <input
              name="is_active"
              type="checkbox"
              value="true"
              defaultChecked={initialValues.is_active ?? true}
              className="w-4 h-4 rounded border-bone/30 bg-bone/5 accent-ochre"
            />
            <span className="text-sm text-bone/70">Active (visible on POS)</span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ochre text-ink text-sm font-medium px-5 py-2 rounded hover:bg-ochre/90 disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : mode === "create" ? "Add Item" : "Save Changes"}
        </button>
        <Link href="/admin/bar/items" className="text-sm text-bone/40 hover:text-bone transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
