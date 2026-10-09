"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="studio-btn studio-btn-secondary studio-btn-sm shrink-0"
    >
      Sign out
    </button>
  );
}
