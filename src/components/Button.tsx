import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonVariant, type Ground } from "@/lib/sound-system";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: yellow, one per screen. outline: second action. lounge: red, Lounge only.
   *  dark: black with yellow text, for forms on paper. */
  variant?: ButtonVariant;
  /** The ground the button sits on; sets the focus ring colour. */
  ground?: Ground;
};

/** A square 46px Sound System button. Works in Server and Client Components. */
export default function Button({ variant = "primary", ground = "black", className = "", type = "button", ...rest }: Props) {
  return <button type={type} className={buttonClasses(variant, ground, className)} {...rest} />;
}
