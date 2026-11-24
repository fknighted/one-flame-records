import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: { absolute: "Family hair care — Petttrice Hair Care" },
  openGraph: { siteName: "Petttrice Hair Care", title: "Family hair care — Petttrice Hair Care" },
  description:
    "Braiding for adults and children, extensions, washing and blow-drying at Petttrice Hair Care. Prices from J$3,000. Visit 5 Creek Street, Montego Bay or call 876-782-2736.",
  alternates: { canonical: "/haircare/styles" },
};

const phone = "tel:+18767822736";
const directions = "https://www.google.com/maps/search/?api=1&query=5+Creek+Street%2C+Montego+Bay%2C+Jamaica";
const services = [
  { title: "Adult braiding", text: "Bring your ideas for your next braided style." },
  { title: "Kids’ braiding", text: "Braiding for the younger members of the family." },
  { title: "Extensions", text: "Call to discuss your style and what to bring." },
  { title: "Wash & blow-dry", text: "Ask about washing and blow-drying for your next visit." },
];

export default function HaircareStylesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/haircare/styles" className={styles.brand}>Petttrice Hair Care</Link>
        <nav aria-label="Petttrice Hair Care">
          <a href="#services">Services</a>
          <a href="#styles">Styles</a>
          <a href="#visit">Visit us</a>
        </nav>
      </header>

      <section className={styles.intro} aria-labelledby="family-title">
        <h1 id="family-title">Braids.<br />For every generation.</h1>
        <div className={styles.introDetails}>
          <p>Hair care for men, women and children in the heart of Montego Bay. Adult and kids’ braiding, extensions, washing and blow-drying.</p>
          <p className={styles.price}>Prices from J$3,000.</p>
          <a href={phone} className={styles.button}>Call for an appointment</a>
        </div>
      </section>

      <section id="styles" className={styles.stylesSection} aria-labelledby="styles-title">
        <div className={styles.sectionHeading}>
          <h2 id="styles-title">Find your next look.</h2>
          <p>Braids, twists and natural texture.</p>
        </div>
        <figure className={styles.figure}>
          <Image
            src="/haircare/family-style-collage.webp"
            alt="Twelve hairstyle ideas for men, women and children, mostly braids: box braids, cornrows, beaded plaits, braided buns and ponytails, plus twists and natural curls."
            width={1086}
            height={1448}
            priority
            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1140px) calc(100vw - 48px), 1086px"
            className={styles.collage}
          />
          <figcaption>Style inspiration. Illustrative images.</figcaption>
        </figure>
      </section>

      <section id="services" className={styles.servicesSection} aria-labelledby="services-title">
        <h2 id="services-title">Care for the whole family.</h2>
        <div className={styles.serviceList}>
          {services.map(({ title, text }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className={styles.priceNote}>Prices start at J$3,000. Call to confirm the price for your style.</p>
      </section>

      <section id="visit" className={styles.visit} aria-labelledby="visit-title">
        <div>
          <h2 id="visit-title">Let’s plan your look.</h2>
          <address>5 Creek Street<br />Montego Bay, Jamaica</address>
          <a href={directions} className={styles.directions}>Get directions</a>
        </div>
        <div className={styles.booking}>
          <p>Tell us about the style you have in mind. Call to discuss prices and availability.</p>
          <a href={phone} className={styles.button}>Call 876-782-2736</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Petttrice Hair Care · Montego Bay</span>
      </footer>
    </div>
  );
}
