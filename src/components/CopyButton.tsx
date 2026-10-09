"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copy link",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="studio-btn studio-btn-secondary studio-btn-sm"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
