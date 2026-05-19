'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Icon } from '@/components/Icon';
import Logo from '@/components/Logo';

export default function WaitlistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('This email is already on the waitlist!');
        } else {
          toast.error(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }
      
      setIsSuccess(true);
      toast.success('You\'ve been added to the waitlist!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Green Bar */}
      <div className="h-4 bg-[#193722] w-full" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px]"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[#040404] mb-2">
                    Join the <span className="text-[#040404]">waitlist</span>
                  </h1>
                  <p className="text-sm text-[#5d655f]">
                    Join the waitlist to get early access, exclusive offers and special benefits
                  </p>
                </div>

                {/* Form Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="border border-[#cdcfcd] rounded-2xl p-6 sm:p-10"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 px-4 rounded-full border border-[#cdcfcd] text-base text-[#040404] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#377749] focus:border-transparent transition-all md:text-sm"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 px-4 rounded-full border border-[#cdcfcd] text-base text-[#040404] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#377749] focus:border-transparent transition-all md:text-sm"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 px-12 rounded-full bg-[#377749] text-white font-medium text-sm hover:bg-[#2b5d39] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            ) : (
              <SuccessScreen 
                key="success"
                name={name}
                email={email}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="py-6 px-4 sm:px-8"
      >
        <div className="max-w-[1128px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo href="/" size="md" />
          <p className="text-xs text-[#5d655f]">
            Join our newsletter to get early access!
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

// Success Screen Component
function SuccessScreen({ 
  name, 
  email, 
  onReset 
}: { 
  name: string; 
  email: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border border-[#cdcfcd] rounded-2xl p-8 sm:p-12 bg-gradient-to-b from-white to-[#f8faf9]"
    >
      {/* Success Icon Animation */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1 
          }}
          className="relative"
        >
          {/* Outer ring animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="absolute inset-0 bg-[#377749]/10 rounded-full"
            style={{ width: 100, height: 100, margin: -10 }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute inset-0 bg-[#377749]/5 rounded-full"
            style={{ width: 120, height: 120, margin: -20 }}
          />
          
          {/* Check circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 bg-[#377749] rounded-full flex items-center justify-center relative z-10"
          >
            <Icon name="check-circle" className="w-10 h-10 text-white" />
          </motion.div>

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute -top-2 -right-2"
          >
            <Icon name="sparkle" className="w-6 h-6 text-[#7cac8a]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#040404]">
          You&apos;re on the list!
        </h2>
        
        <p className="text-[#5d655f] text-sm sm:text-base">
          Thanks for joining, <span className="font-medium text-[#040404]">{name}</span>!
          We&apos;ve added <span className="font-medium text-[#040404]">{email}</span> to our waitlist.
        </p>

        {/* Email Notification Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-[#377749]/5 border border-[#377749]/20 rounded-xl p-4 mt-6 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-[#377749]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="mail" className="w-5 h-5 text-[#377749]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#040404]">Check your inbox</p>
            <p className="text-xs text-[#5d655f]">We&apos;ve sent a confirmation email to you</p>
          </div>
        </motion.div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pt-6 space-y-3"
        >
          <p className="text-xs font-medium text-[#5d655f] uppercase tracking-wider">
            What to expect
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5d655f]">
            {[
              { icon: '🚀', text: 'Early access' },
              { icon: '💰', text: 'Exclusive offers' },
              { icon: '📧', text: 'Launch updates' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                className="bg-white border border-[#cdcfcd] rounded-lg p-3"
              >
                <span className="text-lg mb-1 block">{item.icon}</span>
                <span className="text-[#040404] font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="pt-6 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/"
            className="flex-1 h-11 px-6 rounded-full bg-[#377749] text-white font-medium text-sm hover:bg-[#2b5d39] transition-colors flex items-center justify-center gap-2 group"
          >
            Back to Home
            <Icon name="arrow-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            onClick={onReset}
            className="h-11 px-6 rounded-full border border-[#cdcfcd] text-[#040404] font-medium text-sm hover:bg-[#f5f5f5] transition-colors"
          >
            Add another email
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
