import type { ReactNode } from "react";
import LinkButton from "@/components/LinkButton";

type Props = {
  /** Title type. Keep it short, e.g. "No releases yet." */
  title: string;
  /** One line of body text. */
  body?: string;
  /** One main action. */
  action?: { href: string; label: string };
  /** Or pass your own action element instead. */
  children?: ReactNode;
  className?: string;
};

/**
 * An empty page as an invitation with one action, never "Coming soon".
 * Black panel with a 3px dashed yellow edge.
 */
export default function EmptyState({ title, body, action, children, className = "" }: Props) {
  return (
    <div className={`bg-black border-[3px] border-dashed border-yellow p-5 grid gap-2.5 justify-items-start ${className}`.trim()}>
      <p className="type-title text-paper [overflow-wrap:anywhere]">{title}</p>
      {body && <p className="type-body text-paper max-w-[66ch]">{body}</p>}
      {action && (
        <LinkButton href={action.href} variant="primary" ground="black" className="mt-1">
          {action.label}
        </LinkButton>
      )}
      {children}
    </div>
  );
}
