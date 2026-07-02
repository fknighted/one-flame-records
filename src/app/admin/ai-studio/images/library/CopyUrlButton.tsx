"use client";

import { useState } from "react";

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button type="button" onClick={handleCopy} className="text-xs text-bone/60 hover:text-ochre transition-colors">
      {copied ? "✓ Copied" : "Copy URL"}
    </button>
  );
}
