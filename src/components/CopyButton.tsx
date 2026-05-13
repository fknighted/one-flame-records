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
      className="text-sm font-medium text-ochre hover:text-ochre/80 transition-colors"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
