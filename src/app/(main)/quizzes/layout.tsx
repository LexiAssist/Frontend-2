import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizzes | LexiAssist",
  description: "Create and take AI-generated quizzes to test your knowledge.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
