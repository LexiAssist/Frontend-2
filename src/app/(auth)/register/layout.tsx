import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | LexiAssist",
  description: "Create a free LexiAssist account and start learning smarter today.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
