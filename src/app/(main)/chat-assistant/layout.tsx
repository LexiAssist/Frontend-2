import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat | LexiAssist",
  description: "Chat with your AI study assistant. Ask questions, get explanations, and learn faster.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
