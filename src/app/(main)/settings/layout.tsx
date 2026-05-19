import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | LexiAssist",
  description: "Manage your profile, notifications, privacy, and account preferences.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
