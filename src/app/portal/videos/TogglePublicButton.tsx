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
        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
          isPublic
            ? "bg-forest/20 text-sage hover:bg-forest/30"
            : "bg-bone/10 text-bone/50 hover:bg-bone/20 hover:text-bone/60"
        }`}
      >
        {isPublic ? "Public" : "Private"}
      </button>
    </form>
  );
}
