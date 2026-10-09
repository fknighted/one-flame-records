import Image, { type ImageProps } from "next/image";

type Props = ImageProps & {
  /** The block colour the photo sits on. Never green. */
  tone: "yellow" | "red";
};

/**
 * A next/image printed in three tones (black, the block colour, paper) when it
 * is shown. The uploaded original is never changed. Needs <PrintFilters />
 * on the page (mounted in the public layout). Square corners; no overlay,
 * no hover zoom. Text never sits on top of it.
 */
export default function PrintedPhoto({ tone, className = "", alt, ...rest }: Props) {
  const print = tone === "red" ? "print-red" : "print-yellow";
  return <Image alt={alt} {...rest} className={`${print} ${className}`.trim()} />;
}
