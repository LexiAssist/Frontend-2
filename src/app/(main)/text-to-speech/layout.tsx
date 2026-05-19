import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Speech | LexiAssist",
  description: "Convert text into natural-sounding speech with multiple voices and languages.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
