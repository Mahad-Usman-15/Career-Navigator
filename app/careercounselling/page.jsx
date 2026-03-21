import CareerCounsellingClient from "./CareerCounsellingClient";

export const metadata = {
  title: "Career Assessment — Career Navigator",
  description:
    "Take your MBTI and IQ assessment to get AI-generated career recommendations tailored to your strengths.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/careercounselling`,
  },
};

export default function CareerCounsellingPage() {
  return <CareerCounsellingClient />;
}
