import CareerCounsellingClient from "./CareerCounsellingClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "Career Assessment — Career Navigator",
  description:
    "Take your MBTI and IQ assessment to get AI-generated career recommendations tailored to your strengths.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/careercounselling`,
  },
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=Career+Assessment&description=Discover+your+ideal+career+path+with+AI-powered+MBTI+and+IQ+analysis`],
  },
};

// T018: Wrapped with ErrorBoundary so AI failures don't crash the full page
export default function CareerCounsellingPage() {
  return (
    <ErrorBoundary>
      <CareerCounsellingClient />
    </ErrorBoundary>
  );
}
