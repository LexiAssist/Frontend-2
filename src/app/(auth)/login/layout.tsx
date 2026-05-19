import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | LexiAssist",
  description: "Log in to your LexiAssist account to access your study tools.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
