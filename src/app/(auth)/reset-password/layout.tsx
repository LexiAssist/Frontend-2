import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | LexiAssist",
  description: "Set a new password for your LexiAssist account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
