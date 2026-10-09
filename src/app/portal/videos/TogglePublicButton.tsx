"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  isPublic: boolean;
};

export default function TogglePublicButton({ action, isPublic }: Props) {
  return (
    <form action={action} onClick={(e) => e.stopPropagation()}>
      <button
        type="submit"
        className="studio-btn studio-btn-secondary studio-btn-sm"
      >
        {isPublic ? "Public" : "Private"}
      </button>
    </form>
  );
}
