import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Waitlist | LexiAssist",
  description: "Get early access to LexiAssist — the AI-powered learning assistant for students.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
