// Mechanical format/size exports from the outlined SVG masters. No generative edits.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "brand/fola-village/official");
const publicDir = path.join(root, "public/brand/fola-village");
await fs.mkdir(path.join(out, "png"), { recursive: true });
await fs.mkdir(path.join(out, "web"), { recursive: true });
await fs.mkdir(path.join(out, "icons"), { recursive: true });
await fs.mkdir(path.join(out, "social"), { recursive: true });
for (const file of await fs.readdir(path.join(out, "svg"))) {
  if (!file.endsWith(".svg")) continue;
  const input = path.join(out, "svg", file);
  for (const width of [512, 1600]) {
    await sharp(input, { density: 300 }).resize({ width }).png().toFile(path.join(out, "png", file.replace(".svg", `-${width}.png`)));
  }
  if (file.endsWith("-colour.svg") || file.endsWith("-light.svg")) {
    await sharp(input, { density: 180 }).resize({ width: 1000 }).webp({ quality: 92 }).toFile(path.join(out, "web", file.replace(".svg", ".webp")));
  }
}

const drum = path.join(out, "svg/fola-drum-colour.svg");
const square = (size, background = { r: 255, g: 255, b: 255, alpha: 0 }) =>
  sharp(drum, { density: 300 }).resize(Math.round(size * 0.84), Math.round(size * 0.84), { fit: "contain", background })
    .extend({ top: Math.floor(size * 0.08), left: Math.floor(size * 0.08), bottom: size - Math.round(size * 0.84) - Math.floor(size * 0.08), right: size - Math.round(size * 0.84) - Math.floor(size * 0.08), background });
for (const size of [16, 32, 48, 64, 180, 192, 512]) {
  const paper = { r: 255, g: 247, b: 230, alpha: 1 };
  const background = size >= 180 ? paper : { r: 255, g: 255, b: 255, alpha: 0 };
  const buffer = await square(size, background).png().toBuffer();
  await fs.writeFile(path.join(out, "icons", `drum-${size}.png`), buffer);
  const name = size === 180 ? "apple-touch-icon.png" : size >= 192 ? `app-icon-${size}.png` : `favicon-${size}.png`;
  await fs.writeFile(path.join(publicDir, name), buffer);
}
// ICO containing PNG-encoded frames, supported by modern browsers and Windows.
const frames = await Promise.all([16, 32, 48].map(async size => ({ size, data: await square(size).png().toBuffer() })));
const header = Buffer.alloc(6 + frames.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach(({ size, data }, i) => {
  const p = 6 + i * 16;
  header[p] = size; header[p + 1] = size;
  header.writeUInt16LE(1, p + 4); header.writeUInt16LE(32, p + 6);
  header.writeUInt32LE(data.length, p + 8); header.writeUInt32LE(offset, p + 12);
  offset += data.length;
});
const ico = Buffer.concat([header, ...frames.map(f => f.data)]);
await fs.writeFile(path.join(out, "icons/favicon.ico"), ico);
await fs.writeFile(path.join(publicDir, "favicon.ico"), ico);
await fs.copyFile(path.join(out, "favicon.svg"), path.join(out, "icons/favicon.svg"));

const nested = (source, x, y, width, height) => source.replace(/<svg\b/, `<svg x="${x}" y="${y}"`).replace(/width="[^"]+"/, `width="${width}"`).replace(/height="[^"]+"/, `height="${height}"`);
const emblem = await fs.readFile(path.join(out, "svg/fola-emblem-colour.svg"), "utf8");
const wordmark = await fs.readFile(path.join(out, "svg/fola-wordmark-colour.svg"), "utf8");
const share = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FFF7E6"/>${nested(emblem, 75, 70, 380, 475)}${nested(wordmark, 505, 140, 610, 300)}<text x="810" y="490" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" font-weight="600" fill="#0F0D0B">River. Rhythm. Community.</text></svg>`;
await fs.writeFile(path.join(out, "social/social-share.svg"), share);
const sharePng = await sharp(Buffer.from(share)).png().toBuffer();
await fs.writeFile(path.join(out, "social/social-share-1200x630.png"), sharePng);
await fs.writeFile(path.join(publicDir, "social-share.png"), sharePng);
const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" fill="#FFF7E6"/>${nested(emblem, 180, 100, 720, 880)}</svg>`;
await sharp(Buffer.from(avatarSvg)).png().toFile(path.join(out, "social/profile-1080.png"));
await sharp(path.join(out, "svg/fola-stacked-colour.svg"), { density: 240 }).resize(300).png().toFile(path.join(out, "web/email-logo-300.png"));
const manifest = {
  name: "Fola Village", short_name: "Fola", start_url: "/fola-village", scope: "/fola-village", display: "browser",
  background_color: "#FFF7E6", theme_color: "#0F0D0B",
  icons: [192, 512].map(size => ({ src: `/brand/fola-village/app-icon-${size}.png`, sizes: `${size}x${size}`, type: "image/png", purpose: "any" })),
};
await fs.writeFile(path.join(publicDir, "site.webmanifest"), JSON.stringify(manifest, null, 2));
console.log("Exported transparent PNGs, WebP, email/social files and drum-only website icons.");
