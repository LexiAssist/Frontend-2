import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Goals | LexiAssist",
  description: "Set and track your learning goals to stay motivated and organized.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
