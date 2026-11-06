"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({returnTo="/login"}:{returnTo?:"/login"|"/flames-partner/login"}) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = returnTo;
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
