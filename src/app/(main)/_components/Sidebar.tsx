'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Mic,
  PenSquare,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const primaryGreen = 'var(--primary-500)';
const sidebarGreen = 'var(--primary-500)';
const studyBuddyLinks: NavLink[] = [
  { label: 'Chat', href: '/chat-assistant', icon: MessageSquare },
  { label: 'Flashcards', href: '/flashcards', icon: BookOpen },
  { label: 'Quizzes', href: '/quizzes', icon: FileText },
  { label: 'Materials', href: '/materials', icon: FileText },
  { label: 'Learning Goals', href: '/goals', icon: Target },
];

const mainLinks: NavLink[] = [
  { label: 'Text to Speech', href: '/text-to-speech', icon: Mic },
  { label: 'Reading Assistant', href: '/reading-assistant', icon: BookOpen },
  { label: 'Writing Assistant', href: '/writing-assistant', icon: PenSquare },
];

function LexiAssistMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/lexiassit_logo.jpg"
        alt="LexiAssist"
        width={266}
        height={70}
        className="h-auto w-[140px] sm:w-[170px] object-contain mix-blend-screen"
        priority
      />
    </div>
  );
}

// iOS-style spring animation config
const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
};

const slideInVariants = {
  hidden: { x: '-100%', opacity: 0.8 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 35,
    }
  },
  exit: { 
    x: '-100%', 
    opacity: 0.8,
    transition: { 
      type: 'spring' as const,
      stiffness: 500, 
      damping: 40 
    }
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyBuddyOpen, setStudyBuddyOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const computedName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name;
  const avatarName = computedName || 'Alison Eyo';
  const avatarEmail = user?.email || 'alis@lexiassist';

  const NavItem = ({
    link,
    active,
    nested = false,
    mobile = false,
    onClick,
  }: {
    link: NavLink;
    active: boolean;
    nested?: boolean;
    mobile?: boolean;
    onClick?: () => void;
  }) => {
    const Icon = link.icon;

    return (
      <Link
        href={link.href}
        onClick={onClick}
        className={[
          'flex items-center gap-3 rounded-xl transition-all duration-300 ease-out',
          'active:scale-[0.98] touch-target',
          nested ? 'mx-2 px-4 py-3 text-[13px]' : 'mx-0 px-4 py-3.5 text-sm',
          active
            ? mobile
              ? 'bg-white text-[var(--primary-500)] shadow-lg shadow-black/15 scale-[1.01]'
              : 'bg-white text-[var(--primary-500)] shadow-lg shadow-black/10 scale-[1.01]'
            : mobile
              ? 'text-white/70 hover:text-white hover:bg-white/8 active:bg-white/12'
              : 'text-white/70 hover:text-white hover:bg-white/8 active:bg-white/12',
        ].join(' ')}
      >
        <Icon className={nested ? 'h-4 w-4 flex-shrink-0 opacity-80' : 'h-5 w-5 flex-shrink-0 opacity-80'} />
        <span className={`${active ? 'font-semibold' : 'font-medium'} truncate`}>{link.label}</span>
        {active && (
          <div className={[
            'ml-auto w-1.5 h-1.5 rounded-full',
            mobile ? 'bg-[var(--primary-600)]' : 'bg-[var(--primary-600)]'
          ].join(' ')} />
        )}
      </Link>
    );
  };

  const profileBlock = (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-xl shadow-black/10 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/20 flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <AvatarImage src={user?.avatar} alt={avatarName} />
            <AvatarFallback className="bg-white/10 text-white font-semibold text-sm border border-white/15">
              {avatarName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none text-white">{avatarName}</p>
            <p className="truncate pt-1.5 text-xs text-white/60 font-medium leading-none">{avatarEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="rounded-xl p-2.5 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-95 touch-target flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
          aria-label="Log out"
        >
          <DoorOpen className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const desktopSidebar = (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[300px] flex-col px-5 py-8 text-white bg-gradient-to-b from-[var(--primary-500)] to-[var(--primary-700)] border-r border-white/10 shadow-xl"
    >
      <div className="px-2 pb-6">
        <div className="text-white">
          <LexiAssistMark />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
        <nav className="space-y-5">
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className={[
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ease-out touch-target',
                isActive('/dashboard')
                  ? 'bg-white text-[var(--primary-500)] shadow-lg shadow-black/10 scale-[1.01]'
                  : 'text-white/80 hover:text-white hover:bg-white/8 active:bg-white/12',
              ].join(' ')}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <div className="mx-2 h-px bg-white/10" />
          </div>

          <div className="space-y-2">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Tools</p>
            {mainLinks.map((link) => (
              <NavItem key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setStudyBuddyOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/8 active:bg-white/12 touch-target"
            >
              <Sparkles className="h-5 w-5 opacity-80" />
              <span className="flex-1 text-left">StudyBuddy</span>
              <motion.div
                animate={{ rotate: studyBuddyOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>
            <AnimatePresence>
              {studyBuddyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 pl-2">
                    {studyBuddyLinks.map((link) => (
                      <NavItem
                        key={link.href}
                        link={link}
                        active={isActive(link.href)}
                        nested
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <div className="mt-auto px-2 pt-6">
        {profileBlock}
      </div>
    </aside>
  );

  const mobileDrawer = (
    <>
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200/85 bg-white/80 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors active:bg-slate-100 touch-target"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <div className="text-[var(--primary-500)]">
            <LexiAssistMark />
          </div>
          {/* Profile Avatar */}
          <Link 
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-100)] transition-colors active:bg-[var(--primary-100)] touch-target overflow-hidden"
            aria-label="Profile"
          >
            <span className="text-sm font-semibold">
              {(user?.first_name?.[0] || user?.name?.[0] || 'A') + (user?.last_name?.[0] || user?.name?.split(' ')[1]?.[0] || 'E')}
            </span>
          </Link>
        </div>
      </header>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeInVariants}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideInVariants}
            className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col bg-gradient-to-b from-[var(--primary-500)] to-[var(--primary-700)] text-white shadow-2xl lg:hidden border-r border-white/10"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 bg-transparent text-white">
              <div className="text-white">
                <LexiAssistMark />
              </div>
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white/80 hover:bg-white/10 active:bg-white/15 touch-target"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Drawer Content */}
            <motion.div 
              className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <nav className="space-y-5">
                {/* Dashboard */}
                <motion.div variants={staggerItem} className="space-y-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={[
                      'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ease-out touch-target',
                      isActive('/dashboard')
                        ? 'bg-white text-[var(--primary-500)] shadow-lg shadow-black/15 scale-[1.01]'
                        : 'text-white/70 hover:text-white hover:bg-white/8 active:bg-white/12',
                    ].join(' ')}
                  >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="h-px bg-white/10" />
                </motion.div>

                {/* Main Tools */}
                <motion.div variants={staggerItem} className="space-y-2">
                  <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Tools</p>
                  {mainLinks.map((link, idx) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <NavItem 
                        link={link} 
                        active={isActive(link.href)} 
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* StudyBuddy */}
                <motion.div variants={staggerItem} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setStudyBuddyOpen((open) => !open)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/8 active:bg-white/12 touch-target"
                  >
                    <Sparkles className="h-5 w-5 opacity-80" />
                    <span className="flex-1 text-left">StudyBuddy</span>
                    <motion.div
                      animate={{ rotate: studyBuddyOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {studyBuddyOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-2">
                          {studyBuddyLinks.map((link) => (
                            <NavItem
                              key={link.href}
                              link={link}
                              active={isActive(link.href)}
                              nested
                              onClick={() => setMobileMenuOpen(false)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </nav>
            </motion.div>

            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.3, 
                type: 'spring' as const,
                stiffness: 400,
                damping: 35,
              }}
              className="mx-4 mb-6"
            >
              {profileBlock}
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
