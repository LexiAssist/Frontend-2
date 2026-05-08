'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import svgPaths, { imgGroup } from './svg-paths';
import Logo from '../Logo';

// Image paths (copied to public/landing/)
const imgHeroStudent = '/landing/ec9f20a6dde2af4d8bbb4ba6c62194cc146a41d0.png';
const imgCtaBackground = '/landing/ab8d6a9743d4e4b36d8deaeeb53ecfe1e606935d.png';

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  }
};

// ==========================================
// COMPONENTS
// ==========================================

// Motion-enabled Link component for animations
const MotionLink = motion(Link);

// Button Component
function Button({ children, variant = 'primary', href }: { children: React.ReactNode; variant?: 'primary' | 'white'; href?: string }) {
  const baseClasses = "inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";
  const variantClasses = variant === 'primary'
    ? "bg-[#377749] text-white hover:bg-[#2b5d39] shadow-sm hover:shadow-md"
    : "bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]";

  if (href) {
    return (
      <MotionLink
        href={href}
        className={`${baseClasses} ${variantClasses}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

// Animated Section Header Component
function SectionHeader({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="text-center space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {label && (
        <motion.p
          className="text-[#7cac8a] text-sm font-semibold tracking-[0.1em] uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {label}
        </motion.p>
      )}
      {children}
    </motion.div>
  );
}

// ==========================================
// MAIN LANDING PAGE
// ==========================================

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // If user prefers reduced motion, disable animations
  if (prefersReducedMotion) {
    return <StaticLandingPage />;
  }

  return (
    <div className="bg-white w-full overflow-x-hidden">
      {/* Navigation - Fade in from top */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={fadeInDown}
        className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[1128px]"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between shadow-sm border border-[#cdcfcd]/30">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="white" href="/login">Login</Button>
            <Button variant="primary" href="/register">Sign Up</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 xl:px-20">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content - Staggered animations */}
          <motion.div
            className="space-y-6 sm:space-y-8 lg:space-y-10 relative z-10"
            style={{ y: heroTextY, opacity: heroOpacity }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Main Headline - Each line animates separately */}
            <div className="space-y-2">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-[-0.04em] font-normal"
              >
                <motion.span
                  className="block"
                  variants={fadeInLeft}
                  transition={{ delay: 0 }}
                >
                  Read.
                </motion.span>
                <motion.span
                  className="block text-[#3c8350]"
                  variants={fadeInLeft}
                  transition={{ delay: 0.1 }}
                >
                  Understand.
                </motion.span>
                <motion.span
                  className="block"
                  variants={fadeInLeft}
                  transition={{ delay: 0.2 }}
                >
                  Write. Easier.
                </motion.span>
              </motion.h1>
            </div>

            {/* Subtext - 0.2s delay */}
            <motion.p
              className="text-lg sm:text-xl lg:text-xl text-[#5d655f] leading-relaxed tracking-[-0.02em] max-w-md"
              variants={fadeInLeft}
              transition={{ delay: 0.3 }}
            >
              Lexi Assist is designed to make reading, studying, and writing significantly easier for students who learn differently.
            </motion.p>

            {/* Buttons - 0.3s delay */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              {/* <Button variant="primary" href="/waitlist">ed</Button> */}
              <Button variant="primary" href="/register">Sign Up</Button>
              <Button variant="white" href="/login">Login</Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Image + Card */}
          <motion.div
            className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden"
            style={{ y: heroImageY }}
            variants={fadeInRight}
            initial="hidden"
            animate="visible"
          >
            {/* Image */}
            <div className="absolute inset-0 bg-[#d9d9d9]">
              <Image alt="Student reading" className="object-cover" fill src={imgHeroStudent} sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#193722]/60 to-transparent" />

            {/* Floating Card with continuous float + load animation */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[300px] lg:w-[320px]"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                opacity: { delay: 0.5, duration: 0.6 },
                y: { delay: 0.5, duration: 0.6 },
                scale: { delay: 0.5, duration: 0.6 }
              }}
            >
              <motion.div
                className="bg-white p-6 sm:p-8 shadow-2xl rounded-lg cursor-pointer"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.1
                  }
                }}
                whileHover={{
                  scale: 1.05,
                  y: -15,
                  boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                }}
              >
                <div className="space-y-4">
                  <p className="font-semibold text-base lg:text-lg text-[#3c8350]">
                    Simplified Reading Mode
                  </p>
                  <p className="text-sm lg:text-base text-[#5d655f] leading-relaxed">
                    The mitochondria is often called the powerhouse of the cell. It converts glucose into energy that cells can use for daily functions.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Learning Shouldn't Be a Struggle */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          <SectionHeader>
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]"
              variants={fadeInUp}
            >
              <span className="block">Learning Shouldn&apos;t Be</span>
              <span>a <em className="font-semibold not-italic text-[#3c8350]">Struggle.</em></span>
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-[#424843] leading-relaxed tracking-[-0.02em]"
              variants={staggerItem}
            >
              We understand the biggest challenges for students who learn differently
            </motion.p>
          </SectionHeader>

          {/* Feature Cards - Staggered from bottom */}
          <motion.div
            className="grid md:grid-cols-3 gap-0 border border-[#cdcfcd] rounded-2xl overflow-hidden"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { title: "Complex Text", desc: "Struggling to read complex, crowded text." },
              { title: "Word Decoding", desc: "Difficulty decoding words and retaining information." },
              { title: "Writing Stress", desc: "Stress and anxiety from writing lengthy assignments." }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 sm:p-8 lg:p-10 min-h-[160px] flex items-center border-b md:border-b-0 md:border-r border-[#cdcfcd] last:border-0 cursor-pointer"
                variants={staggerItem}
                custom={index}
                whileHover={{
                  backgroundColor: '#f8faf9',
                  scale: 1.02,
                  zIndex: 10
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <motion.p
                    className="font-medium text-lg leading-snug"
                    whileHover={{ color: '#3c8350' }}
                  >
                    {item.title}
                  </motion.p>
                  <p className="text-[#5d655f] leading-relaxed text-sm sm:text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Built Around Your Learning Style */}
      <section className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-[1127px] mx-auto space-y-16 sm:space-y-20 lg:space-y-24">
          <SectionHeader label="Our Approach">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]">
              <span className="block">Built Around</span>
              <span><em className="font-semibold not-italic text-[#3c8350]">Your</em> Learning Style</span>
            </h2>
          </SectionHeader>

          <div className="space-y-16 sm:space-y-20 lg:space-y-28">
            <ParallaxFeature
              number="01"
              title="Simplified, readable text and structured explanations."
              description="AI-powered text simplification breaks down complex content into clear, digestible language without losing the meaning."
              icon={<BookIcon />}
              reverse={false}
            />

            <motion.div
              className="border-t border-[#cdcfcd]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />

            <ParallaxFeature
              number="02"
              title="Individual needs matter. You choose your perfect settings."
              description="Fully customizable reader mode with font choices, spacing, color overlays, and contrast settings tuned to you."
              icon={<SettingsIcon />}
              reverse={true}
            />

            <motion.div
              className="border-t border-[#cdcfcd]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />

            <ParallaxFeature
              number="03"
              title="Multisensory learning is key."
              description="Text-to-speech, visual highlights, and interactive tools engage multiple senses to reinforce comprehension and memory."
              icon={<HeadphonesIcon />}
              reverse={false}
            />

            <motion.div
              className="border-t border-[#cdcfcd]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />

            <ParallaxFeature
              number="04"
              title="Reduce writing stress, leverage your verbal strengths."
              description="Voice-to-text and AI writing assistance transform how you express ideas — no more blank-page anxiety."
              icon={<MicIcon />}
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* Three Steps to Easier Learning */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
          <SectionHeader label="Process">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]">
              <span className="block">Three Steps to</span>
              <span><em className="font-semibold not-italic text-[#3c8350]">Easier</em> Learning</span>
            </h2>
          </SectionHeader>

          <div className="relative space-y-12 sm:space-y-16">
            <motion.div
              className="absolute left-[30px] sm:left-[62px] top-[60px] sm:top-[80px] bottom-[60px] sm:bottom-[80px] w-px bg-[#cdcfcd] hidden md:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ originY: 0 }}
            />

            {[
              { num: 1, title: "Upload Your Content", desc: "Drop in any .docx, PDF, or image file. LexiAssist instantly processes your document and prepares it for accessible reading." },
              { num: 2, title: "Choose Your Tools", desc: "Activate text-to-speech, AI simplification, or open Reader Mode to customize every aspect of your reading experience." },
              { num: 3, title: "Learn Effortlessly", desc: "Read, study, and write with reduced stress and increased comprehension. Your learning, on your terms." }
            ].map((step, index) => (
              <motion.div
                key={step.num}
                className="flex gap-6 sm:gap-8 lg:gap-28 items-start"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <motion.div
                  className="flex-shrink-0 size-[60px] sm:size-[80px] lg:size-[123px] rounded-full bg-[#193722] flex items-center justify-center text-white text-xl sm:text-2xl lg:text-4xl tracking-tight shadow-md cursor-pointer"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: '#3c8350',
                    boxShadow: '0 10px 30px rgba(60, 131, 80, 0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.num}
                </motion.div>
                <div className="flex-1 space-y-2 sm:space-y-4 pt-2 sm:pt-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl leading-tight tracking-tight">{step.title}</h3>
                  <p className="text-base sm:text-lg text-[#5d655f] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <CTASection />

      {/* Footer */}
      <motion.footer
        className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[1128px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo href="/" size="md" />
          <p className="text-sm text-[#5d655f] text-center">
            ©2026 LexiAssist. All rights reserved
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

// Static version for reduced motion preference - FULL CONTENT
function StaticLandingPage() {
  return (
    <div className="bg-white w-full overflow-x-hidden">
      <nav className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[1128px]">
        <div className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between shadow-sm border border-[#cdcfcd]/30">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-2 sm:gap-4">
            {/* <Link href="/waitlist" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]">Login</Link> */}
            <Link href="/login" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]">Login</Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-[#377749] text-white hover:bg-[#2b5d39]">Sign Up</Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 xl:px-20">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 relative z-10">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-[-0.04em] font-normal">
                <span className="block">Read.</span>
                <span className="block text-[#3c8350]">Understand.</span>
                <span className="block">Write. Easier.</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-xl text-[#5d655f] leading-relaxed tracking-[-0.02em] max-w-md">
                Lexi Assist is designed to make reading, studying, and writing significantly easier for students who learn differently.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/login" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]">Login</Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-[#377749] text-white hover:bg-[#2b5d39]">Sign Up</Link>
              {/* <Link href="/waitlist" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]">Login</Link> */}
            </div>
          </div>

          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[#d9d9d9]">
              <Image alt="Student reading" className="object-cover" fill src={imgHeroStudent} sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#193722]/60 to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[300px] lg:w-[320px]">
              <div className="bg-white p-6 sm:p-8 shadow-2xl rounded-lg">
                <div className="space-y-4">
                  <p className="font-semibold text-base lg:text-lg text-[#3c8350]">Simplified Reading Mode</p>
                  <p className="text-sm lg:text-base text-[#5d655f] leading-relaxed">The mitochondria is often called the powerhouse of the cell. It converts glucose into energy that cells can use for daily functions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Shouldn't Be a Struggle - Static */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]">
              <span className="block">Learning Shouldn&apos;t Be</span>
              <span>a <em className="font-semibold not-italic text-[#3c8350]">Struggle.</em></span>
            </h2>
            <p className="text-lg sm:text-xl text-[#424843] leading-relaxed tracking-[-0.02em]">
              We understand the biggest challenges for students who learn differently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-[#cdcfcd] rounded-2xl overflow-hidden">
            {[
              { title: "Complex Text", desc: "Struggling to read complex, crowded text." },
              { title: "Word Decoding", desc: "Difficulty decoding words and retaining information." },
              { title: "Writing Stress", desc: "Stress and anxiety from writing lengthy assignments." }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 lg:p-10 min-h-[160px] flex items-center border-b md:border-b-0 md:border-r border-[#cdcfcd] last:border-0"
              >
                <div className="space-y-3">
                  <p className="font-medium text-lg leading-snug">{item.title}</p>
                  <p className="text-[#5d655f] leading-relaxed text-sm sm:text-base">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built Around Your Learning Style - Static */}
      <section className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-[1127px] mx-auto space-y-16 sm:space-y-20 lg:space-y-24">
          <div className="text-center space-y-4 sm:space-y-6">
            <p className="text-[#7cac8a] text-sm font-semibold tracking-[0.1em] uppercase">Our Approach</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]">
              <span className="block">Built Around</span>
              <span><em className="font-semibold not-italic text-[#3c8350]">Your</em> Learning Style</span>
            </h2>
          </div>

          <div className="space-y-16 sm:space-y-20 lg:space-y-28">
            <StaticFeature
              number="01"
              title="Simplified, readable text and structured explanations."
              description="AI-powered text simplification breaks down complex content into clear, digestible language without losing the meaning."
              icon={<BookIcon />}
              reverse={false}
            />

            <div className="border-t border-[#cdcfcd]" />

            <StaticFeature
              number="02"
              title="Individual needs matter. You choose your perfect settings."
              description="Fully customizable reader mode with font choices, spacing, color overlays, and contrast settings tuned to you."
              icon={<SettingsIcon />}
              reverse={true}
            />

            <div className="border-t border-[#cdcfcd]" />

            <StaticFeature
              number="03"
              title="Multisensory learning is key."
              description="Text-to-speech, visual highlights, and interactive tools engage multiple senses to reinforce comprehension and memory."
              icon={<HeadphonesIcon />}
              reverse={false}
            />

            <div className="border-t border-[#cdcfcd]" />

            <StaticFeature
              number="04"
              title="Reduce writing stress, leverage your verbal strengths."
              description="Voice-to-text and AI writing assistance transform how you express ideas — no more blank-page anxiety."
              icon={<MicIcon />}
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* Three Steps - Static */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 sm:space-y-6">
            <p className="text-[#7cac8a] text-sm font-semibold tracking-[0.1em] uppercase">Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-[-0.04em]">
              <span className="block">Three Steps to</span>
              <span><em className="font-semibold not-italic text-[#3c8350]">Easier</em> Learning</span>
            </h2>
          </div>

          <div className="relative space-y-12 sm:space-y-16">
            <div className="absolute left-[30px] sm:left-[62px] top-[60px] sm:top-[80px] bottom-[60px] sm:bottom-[80px] w-px bg-[#cdcfcd] hidden md:block" />

            {[
              { num: 1, title: "Upload Your Content", desc: "Drop in any .docx, PDF, or image file. LexiAssist instantly processes your document and prepares it for accessible reading." },
              { num: 2, title: "Choose Your Tools", desc: "Activate text-to-speech, AI simplification, or open Reader Mode to customize every aspect of your reading experience." },
              { num: 3, title: "Learn Effortlessly", desc: "Read, study, and write with reduced stress and increased comprehension. Your learning, on your terms." }
            ].map((step) => (
              <div key={step.num} className="flex gap-6 sm:gap-8 lg:gap-28 items-start">
                <div className="flex-shrink-0 size-[60px] sm:size-[80px] lg:size-[123px] rounded-full bg-[#193722] flex items-center justify-center text-white text-xl sm:text-2xl lg:text-4xl tracking-tight shadow-md">
                  {step.num}
                </div>
                <div className="flex-1 space-y-2 sm:space-y-4 pt-2 sm:pt-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl leading-tight tracking-tight">{step.title}</h3>
                  <p className="text-base sm:text-lg text-[#5d655f] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Static */}
      <section className="relative py-20 sm:py-24 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black from-[36%] to-[#011f0a] to-[88%]">
          <Image alt="" className="object-cover opacity-20" fill src={imgCtaBackground} sizes="100vw" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center space-y-8 sm:space-y-12 lg:space-y-16">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-[-0.04em]">
              Built on Evidence-Based Dyslexia Learning Research.
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-[#cdcfcd] leading-tight tracking-[-0.02em]">
              Unlock easier learning
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/login" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-white text-[#272a28] border border-[#cdcfcd] hover:bg-[#f5f5f5]">Login</Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base bg-[#377749] text-white hover:bg-[#2b5d39]">Sign Up</Link>
          </div>
        </div>
      </section>

      {/* Footer - Static */}
      <footer className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-40">
        <div className="max-w-[1128px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo href="/" size="md" />
          <p className="text-sm text-[#5d655f] text-center">
            ©2026 LexiAssist. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

// Parallax Feature Component
function ParallaxFeature({
  number,
  title,
  description,
  icon,
  reverse
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reverse: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const iconY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className={`space-y-4 ${reverse ? 'lg:order-2' : ''}`}
        style={{ y: reverse ? undefined : y }}
      >
        <motion.div
          className="text-[#eff0ef] text-7xl sm:text-8xl lg:text-[128px] leading-none tracking-[-0.04em]"
          initial={{ opacity: 0, x: reverse ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {number}
        </motion.div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-[-0.03em]">
          {title}
        </h3>
        <p className="text-base sm:text-lg text-[#5d655f] leading-relaxed">
          {description}
        </p>
      </motion.div>
      <motion.div
        className={`flex justify-center ${reverse ? 'lg:order-1' : 'lg:justify-end'}`}
        style={{ y: reverse ? y : iconY }}
      >
        <motion.div
          className="size-[280px] sm:size-[320px] lg:size-[376px] rounded-full bg-[#193722] flex items-center justify-center shadow-lg cursor-pointer"
          whileHover={{
            scale: 1.08,
            boxShadow: '0 30px 60px rgba(25, 55, 34, 0.4)',
            rotate: reverse ? -5 : 5
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {icon}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Static Feature Component (for reduced motion)
function StaticFeature({
  number,
  title,
  description,
  icon,
  reverse
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={`space-y-4 ${reverse ? 'lg:order-2' : ''}`}>
        <div className="text-[#eff0ef] text-7xl sm:text-8xl lg:text-[128px] leading-none tracking-[-0.04em]">
          {number}
        </div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-[-0.03em]">
          {title}
        </h3>
        <p className="text-base sm:text-lg text-[#5d655f] leading-relaxed">
          {description}
        </p>
      </div>
      <div className={`flex justify-center ${reverse ? 'lg:order-1' : 'lg:justify-end'}`}>
        <div className="size-[280px] sm:size-[320px] lg:size-[376px] rounded-full bg-[#193722] flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

// CTA Section with Parallax
function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 lg:py-32 px-4 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black from-[36%] to-[#011f0a] to-[88%]"
        style={{ y: backgroundY }}
      >
        <Image alt="" className="object-cover opacity-20" fill src={imgCtaBackground} sizes="100vw" />
      </motion.div>
      <motion.div
        className="relative max-w-5xl mx-auto text-center space-y-8 sm:space-y-12 lg:space-y-16"
        style={{ y: textY, opacity }}
      >
        <div className="space-y-4 sm:space-y-6">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-[-0.04em]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Built on Evidence-Based Dyslexia Learning Research.
          </motion.h2>
          <motion.p
            className="text-xl sm:text-2xl lg:text-3xl text-[#cdcfcd] leading-tight tracking-[-0.02em]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Unlock easier learning
          </motion.p>
        </div>
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="white" href="/login">Login</Button>
          <Button variant="primary" href="/register">Sign Up</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Icon Components
function BookIcon() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
      <rect x="10" y="0" width="50" height="70" rx="2" fill="white" />
      <rect x="15" y="5" width="15" height="60" fill="white" stroke="white" strokeWidth="2" />
      <rect x="35" y="5" width="20" height="60" fill="white" />
      <line x1="38" y1="10" x2="52" y2="10" stroke="#193722" strokeWidth="2" />
      <line x1="38" y1="18" x2="52" y2="18" stroke="#193722" strokeWidth="2" />
      <line x1="38" y1="26" x2="52" y2="26" stroke="#193722" strokeWidth="2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
      <circle cx="45" cy="40" r="25" fill="white" />
      <circle cx="45" cy="40" r="12" fill="#193722" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
      <path d="M45 15C30 15 20 25 20 40V55" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M45 15C60 15 70 25 70 40V55" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="15" y="45" width="10" height="20" rx="3" fill="white" />
      <rect x="65" y="45" width="10" height="20" rx="3" fill="white" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
      <rect x="38" y="15" width="14" height="25" rx="7" fill="white" />
      <path d="M30 35C30 42 36 48 45 48C54 48 60 42 60 35" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="45" y1="48" x2="45" y2="60" stroke="white" strokeWidth="3" />
      <line x1="35" y1="60" x2="55" y2="60" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
