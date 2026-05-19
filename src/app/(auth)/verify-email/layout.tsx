import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | LexiAssist",
  description: "Verify your email address to complete your LexiAssist registration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
