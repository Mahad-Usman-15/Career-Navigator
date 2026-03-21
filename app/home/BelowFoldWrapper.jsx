"use client";

import dynamic from "next/dynamic";

const BelowFoldClient = dynamic(() => import("./BelowFoldClient"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh" }} />,
});

export default function BelowFoldWrapper() {
  return <BelowFoldClient />;
}
