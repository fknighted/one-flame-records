import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonVariant, type Ground } from "@/lib/sound-system";

type Props = ComponentProps<typeof Link> & {
  /** primary: yellow, one per screen. outline: second action. lounge: red, Lounge only.
   *  dark: black with yellow text, for blocks on paper. */
  variant?: ButtonVariant;
  /** The ground the button sits on; sets the focus ring colour. */
  ground?: Ground;
};

/** A next/link styled as a square 46px Sound System button. */
export default function LinkButton({ variant = "primary", ground = "black", className = "", ...rest }: Props) {
  return <Link className={buttonClasses(variant, ground, className)} {...rest} />;
}
