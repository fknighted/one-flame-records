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
          body: `${session.station ?? "Session"} time is up!`,
          icon: "/icon-192.png",
        });
      }
    }
  }, [durationMins, notified, session.started_at, session.station]);

  useEffect(() => {
    if (durationMins === null) return;
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [durationMins, tick]);

  const isOvertime = secondsLeft !== null && secondsLeft < 0;

  return (
    <div className={`studio-card flex items-center gap-3 !py-3 ${
      expired || isOvertime ? "!border-red" : ""
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-paper font-semibold text-[15px] [overflow-wrap:anywhere]">
          Drop-in
          {session.station && <span className="text-muted ml-2 font-normal">· {session.station}</span>}
          {session.price_jmd && (
            <span className="ml-2 studio-money text-[18px]">
              ${session.price_jmd}
            </span>
          )}
        </p>
        {durationMins !== null && secondsLeft !== null ? (
          <p className={`text-[14px] studio-figures ${
            expired || isOvertime ? "text-paper font-bold" : "text-muted font-semibold"
          }`}>
            {expired || isOvertime ? "OVERTIME " : ""}
            {formatCountdown(secondsLeft)} {!expired && !isOvertime ? "remaining" : ""}
          </p>
        ) : (
          <p className="text-muted text-[13px]">No duration set</p>
        )}
      </div>

      {expired && (
        <span className="studio-chip studio-chip-bad shrink-0">
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
