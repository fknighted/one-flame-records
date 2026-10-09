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
        className="studio-btn studio-btn-danger studio-btn-sm"
        onClick={(e) => {
          if (!confirm(`Deactivate ${email}?`)) e.preventDefault();
        }}
      >
        Deactivate
      </button>
    </form>
  );
}
