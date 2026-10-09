"use client";

import { revokeBartenderFlag } from "./actions";

export default function RevokeBarAccessButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <form action={revokeBartenderFlag.bind(null, userId)}>
      <button
        type="submit"
        className="studio-btn studio-btn-danger studio-btn-sm"
        onClick={(e) => {
          if (!confirm(`Revoke bar access for ${email}?`)) e.preventDefault();
        }}
      >
        Revoke Bar Access
      </button>
    </form>
  );
}
