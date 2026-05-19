import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards | LexiAssist",
  description: "Generate and study AI-powered flashcard decks from your course materials.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
