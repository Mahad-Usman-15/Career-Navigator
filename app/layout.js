import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import  { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://aipowered-career-navigator.vercel.app"),
  title: {
    default: "Career Navigator — AI Career Guidance Pakistan",
    template: "%s | Career Navigator",
  },
  description:
    "AI-powered career guidance for students and graduates in Pakistan. MBTI assessments, skill gap analysis, and personalized career roadmaps.",
  openGraph: {
    siteName: "Career Navigator",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Career Navigator — AI Career Guidance for Students in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

const clerkAppearance = {
  layout: {
    logoPlacement: "inside",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#222222",
    colorInputBackground: "#333333",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.6)",
    colorNeutral: "#ffffff",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    card: "shadow-2xl border border-white/10",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-white/60",
    socialButtonsBlockButton:
      "border-white/20 text-white hover:bg-white/10 transition-colors",
    dividerLine: "bg-white/10",
    dividerText: "text-white/40",
    formFieldLabel: "text-white/80 font-medium",
    formFieldInput:
      "bg-[#333333] border-white/20 text-white placeholder-white/30 focus:border-blue-500 focus:ring-blue-500",
    formButtonPrimary:
      "bg-gradient-to-r from-blue-900 to-blue-500 hover:opacity-90 transition-opacity font-semibold",
    footerActionLink: "text-blue-400 hover:text-blue-300",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-blue-400",
    alertText: "text-white/80",
    formFieldErrorText: "text-red-400",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://clerk.accounts.dev" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://clerk.accounts.dev" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider appearance={clerkAppearance}>
          <Navbar />
          {children}
          <Footer />
        </ClerkProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Career Navigator",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://aipowered-career-navigator.vercel.app",
              description: "AI-powered career guidance for students and graduates in Pakistan",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_APP_URL || "https://aipowered-career-navigator.vercel.app"}/{search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Career Navigator",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://aipowered-career-navigator.vercel.app",
              description: "AI-powered career guidance platform for students and graduates in Pakistan",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Karachi",
                addressCountry: "PK",
              },
            }),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
