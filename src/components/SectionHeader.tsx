type Props = {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
};

export default function SectionHeader({ title, eyebrow, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-forest mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display font-bold text-oxblood text-[2rem] leading-[1.1] tracking-tight">
          {title}
        </h2>
        <div className="mt-2 h-px w-16 bg-oxblood" />
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}
