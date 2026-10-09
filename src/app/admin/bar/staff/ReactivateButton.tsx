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
        className="studio-btn studio-btn-secondary studio-btn-sm"
        onClick={(e) => {
          if (!confirm(`Reactivate ${email}?`)) e.preventDefault();
        }}
      >
        Reactivate
      </button>
    </form>
  );
}
