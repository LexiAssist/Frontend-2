import Image from "next/image";

export default function StudyBuddy() {
  return (
    <div className="relative w-full h-full">
      <Image
        src="/images/STUDY BUDDY SVG.svg"
        alt="Study Buddy Illustration"
        fill
        className="object-contain"
      />
    </div>
  );
}
