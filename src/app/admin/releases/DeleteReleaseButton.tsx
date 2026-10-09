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
        className="studio-btn studio-btn-danger studio-btn-sm"
        title="Delete release"
        aria-label="Delete release"
        onClick={(e) => { if (!confirm(`Delete release "${title}"?`)) e.preventDefault(); }}
      >
        ×
      </button>
    </form>
  );
}
