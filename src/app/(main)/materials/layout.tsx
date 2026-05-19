import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Materials | LexiAssist",
  description: "Upload and manage your course materials, documents, and study resources.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
