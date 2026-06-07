type Props = {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  dark?: boolean;
};

export default function SectionHeader({ title, eyebrow, action, dark = false }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-8 sm:mb-10">
      <div>
        {eyebrow && (
          <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] mb-1.5 ${
            dark ? "text-forest" : "text-forest"
          }`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`font-display font-bold text-3xl sm:text-[2.25rem] leading-[1.05] tracking-tight ${
          dark ? "text-bone" : "text-oxblood"
        }`}>
          {title}
        </h2>
        <div className={`mt-2 h-px w-16 ${dark ? "bg-bone/30" : "bg-oxblood"}`} />
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}
