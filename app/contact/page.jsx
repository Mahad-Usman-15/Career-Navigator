import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us — Career Navigator",
  description:
    "Get in touch with the Career Navigator team. We help students in Pakistan navigate their career journey.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us — Career Navigator",
    description:
      "Get in touch with the Career Navigator team. We help students in Pakistan navigate their career journey.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_APP_URL },
              { "@type": "ListItem", position: 2, name: "Contact", item: `${process.env.NEXT_PUBLIC_APP_URL}/contact` },
            ],
          }),
        }}
      />
      <ContactClient />
    </>
  );
}
