"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/useAuth";
import Logo from "@/components/auth/Logo";
import Image from "next/image";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#ECF3EE] relative overflow-hidden">
        <div className="absolute top-8 left-8 z-10">
          <Logo />
        </div>
        <div className="absolute inset-0">
          <Image
            src="/images/girl on a laptop.svg"
            alt="Girl studying on laptop"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {isSubmitted ? (
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-16 h-16 bg-[#377749]/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#377749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
                  Check your email
                </h1>
                <p className="text-[#555C56]">
                  If an account exists for <strong>{submittedEmail}</strong>, we&apos;ve sent password reset instructions to that address.
                </p>
              </div>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-[#555C56]">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmittedEmail("");
                      reset();
                    }}
                    className="flex-1 h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 h-12 border border-[#D0D5DD] hover:border-[#377749] text-[#374151] font-semibold rounded-full transition-all duration-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-12 h-12 bg-[#377749]/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#377749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
                  Forgot password?
                </h1>
                <p className="text-[#555C56]">
                  No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-[#101928]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {forgotPasswordMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-sm pt-4 border-t border-[#E5E7EB]">
                <span className="text-[#555C56]">Remember your password?</span>
                <Link href="/login" className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}