"use client";

import { useState, useEffect, useCallback } from "react";

const DURATION_MINUTES: Record<string, number> = {
  half_hour: 30,
  one_hour:  60,
};

type ActiveSession = {
  id: string;
  started_at: string;
  station: string | null;
  duration_type: string | null;
  price_jmd: number | null;
  member_name: string | null;
};

function formatCountdown(secondsLeft: number): string {
  const m = Math.floor(Math.abs(secondsLeft) / 60);
  const s = Math.abs(secondsLeft) % 60;
  const sign = secondsLeft < 0 ? "-" : "";
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

function SessionRow({ session }: { session: ActiveSession }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [expired, setExpired]         = useState(false);
  const [notified, setNotified]       = useState(false);

  const durationMins = session.duration_type ? (DURATION_MINUTES[session.duration_type] ?? null) : null;

  const tick = useCallback(() => {
    if (durationMins === null) return;
    const endMs = new Date(session.started_at).getTime() + durationMins * 60 * 1000;
    const remaining = Math.floor((endMs - Date.now()) / 1000);
    setSecondsLeft(remaining);

    if (remaining <= 0 && !notified) {
      setExpired(true);
      setNotified(true);
      // Request browser notification if permission already granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Session Ended", {
          body: `${session.member_name ?? session.station ?? "Session"} time is up!`,
          icon: "/icon-192.png",
        });
      }
    }
  }, [durationMins, notified, session.started_at, session.member_name, session.station]);

  useEffect(() => {
    if (durationMins === null) return;
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [durationMins, tick]);

  const isOvertime = secondsLeft !== null && secondsLeft < 0;

  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
      expired
        ? "border-red-500/40 bg-red-900/10 animate-pulse"
        : isOvertime
        ? "border-red-500/20 bg-red-900/5"
        : "border-bone/15"
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-bone font-medium text-sm">
          {session.member_name ?? "Drop-in"}
          {session.station && <span className="text-bone/60 ml-2 font-normal">· {session.station}</span>}
          {session.price_jmd && (
            <span className="ml-2 text-xs font-mono text-ochre">
              ${session.price_jmd}
            </span>
          )}
        </p>
        {durationMins !== null && secondsLeft !== null ? (
          <p className={`text-xs font-mono font-semibold ${
            expired ? "text-red-400" : isOvertime ? "text-red-400/70" : "text-bone/60"
          }`}>
            {expired || isOvertime ? "⏰ OVERTIME " : ""}
            {formatCountdown(secondsLeft)} {!expired && !isOvertime ? "remaining" : ""}
          </p>
        ) : (
          <p className="text-bone/60 text-xs">No duration set</p>
        )}
      </div>

      {expired && (
        <span className="text-xs font-semibold text-red-400 bg-red-900/20 border border-red-500/30 rounded-full px-2 py-0.5 shrink-0">
          Time Up
        </span>
      )}
    </div>
  );
}

export default function SessionTimer({ sessions }: { sessions: ActiveSession[] }) {
  const [permAsked, setPermAsked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default" && !permAsked) {
      setPermAsked(true);
      Notification.requestPermission();
    }
  }, [permAsked]);

  if (!sessions.length) return null;

  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
