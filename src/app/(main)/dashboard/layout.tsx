import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | LexiAssist",
  description: "Track your study progress, streaks, quizzes, and learning goals.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
