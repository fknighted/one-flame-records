"use client";

type Props = {
  action: () => void | Promise<void>;
  title: string;
};

export default function DeleteReleaseButton({ action, title }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-xs text-bone/50 hover:text-red-400 transition-colors"
        title="Delete release"
        onClick={(e) => { if (!confirm(`Delete release "${title}"?`)) e.preventDefault(); }}
      >
        ×
      </button>
    </form>
  );
}
