"use client";

import { reactivateBartender } from "./actions";

export default function ReactivateButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <form action={reactivateBartender.bind(null, userId)}>
      <button
        type="submit"
        className="text-xs text-forest/70 hover:text-forest transition-colors"
        onClick={(e) => {
          if (!confirm(`Reactivate ${email}?`)) e.preventDefault();
        }}
      >
        Reactivate
      </button>
    </form>
  );
}
