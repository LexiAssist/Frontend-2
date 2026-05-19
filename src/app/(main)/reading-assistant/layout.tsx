import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Assistant | LexiAssist",
  description: "Upload documents and get AI-generated summaries, vocabulary help, and audio narration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
