import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LexAssist - Read. Understand. Write. Easier.",
  description: "LexAssist is designed to make reading, studying, and writing significantly easier for students who learn differently.",
};

export default function Home() {
  return <LandingPage />;
}
