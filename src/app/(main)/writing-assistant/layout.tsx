import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing Assistant | LexiAssist",
  description: "Get AI-powered writing help, transcription, and note generation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
