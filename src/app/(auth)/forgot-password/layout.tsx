import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | LexiAssist",
  description: "Reset your LexiAssist account password.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
