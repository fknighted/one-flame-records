import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./haircare.module.css";

export const metadata: Metadata = {
  title: { absolute: "Petttrice Hair Care" },
  openGraph: { siteName: "Petttrice Hair Care", title: "Petttrice Hair Care" },
  description:
    "Adult and kids’ braiding, extensions, washing and blow-drying at Petttrice Hair Care, 5 Creek Street, Montego Bay. Prices from J$3,000. Call 876-782-2736.",
  alternates: { canonical: "/haircare" },
};

const phone = "tel:+18767822736";
const directions = "https://www.google.com/maps/search/?api=1&query=5+Creek+Street%2C+Montego+Bay%2C+Jamaica";

export default function HaircarePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/haircare" className={styles.parentBrand}>Petttrice Hair Care</Link>
        <nav aria-label="Hair care">
          <Link href="/haircare">Home</Link>
          <Link href="/haircare" aria-current="page">Hair care</Link>
          <a href="#haircare-contact">Contact</a>
        </nav>
      </header>

      <h1 className={styles.name}>Petttrice Hair Care</h1>

      <section className={styles.hero} aria-labelledby="haircare-headline">
        <h2 id="haircare-headline" className={styles.headline}>
          <span>Find your</span><span>next look.</span>
        </h2>
        <div className={styles.intro}>
          <p className={styles.summary}>Adult and kids’ braiding, extensions, washing and blow-drying.</p>
          <p className={styles.pricing}>Prices from J$3,000.</p>
          <a className={styles.button} href={phone}>Ask about a style</a>
        </div>
      </section>

      <section className={styles.gallery} aria-label="Hairstyle inspiration">
        <figure className={styles.tallFigure}>
          <div className={styles.tallPhoto}>
            <Image
              src="/haircare/gallery-braids.webp"
              alt="Illustrative braided hairstyle on a red background"
              fill
              priority
              sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1280px) 35vw, 430px"
            />
          </div>
          <figcaption>Braids</figcaption>
        </figure>

        <figure className={styles.centerFigure}>
          <div className={styles.centerPhotos}>
            <div className={styles.naturalPhoto}>
              <Image
                src="/haircare/gallery-natural.webp"
                alt="Illustrative portrait of voluminous natural curls on yellow"
                fill
                priority
                sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1280px) 31vw, 380px"
              />
            </div>
            <div className={styles.textureLabel}>Natural texture</div>
            <div className={styles.curlPhoto}>
              <Image
                src="/haircare/gallery-curls.webp"
                alt="Illustrative side portrait showing short natural curls"
                fill
                sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1280px) 31vw, 380px"
              />
            </div>
          </div>
          <figcaption>Curls</figcaption>
        </figure>

        <figure className={styles.tallFigure}>
          <div className={styles.tallPhoto}>
            <Image
              src="/haircare/gallery-twists.webp"
              alt="Illustrative twist updo on a yellow background"
              fill
              priority
              sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 1280px) 31vw, 380px"
            />
          </div>
          <figcaption>Twists</figcaption>
        </figure>
      </section>

      <section id="haircare-contact" className={styles.contact} aria-labelledby="contact-title">
        <div>
          <h2 id="contact-title" className={styles.contactTitle}>Let’s plan your look.</h2>
          <p>Tell us about the style you have in mind and start a hair-care enquiry.</p>
          <address>5 Creek Street, Montego Bay <span aria-hidden="true">·</span> <a href={phone}>876-782-2736</a></address>
          <a href={directions} className={styles.directions}>Get directions</a>
        </div>
        <a className={styles.button} href={phone}>Get in touch</a>
      </section>
      <p className={styles.imageNote}>Style inspiration. Images are illustrative. Call to confirm the price for your style.</p>
    </div>
  );
}
