"use client";

import { deactivateBartender } from "./actions";

export default function DeactivateButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <form action={deactivateBartender.bind(null, userId)}>
      <button
        type="submit"
        className="text-xs text-oxblood/50 hover:text-oxblood transition-colors"
        onClick={(e) => {
          if (!confirm(`Deactivate ${email}?`)) e.preventDefault();
        }}
      >
        Deactivate
      </button>
    </form>
  );
}
