"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useVerifyEmail, useResendVerification } from "@/hooks/useAuth";
import Logo from "@/components/auth/Logo";
import Image from "next/image";

export default function VerifyEmailPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification(userId || '');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (fullCode: string) => {
    if (!userId) {
      setError("User ID is missing. Please try registering again.");
      return;
    }

    try {
      await verifyMutation.mutateAsync({ userId, code: fullCode });
    } catch {
      setError("Invalid verification code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || !userId) return;
    
    try {
      await resendMutation.mutateAsync();
      setCode(["", "", "", "", "", ""]);
      setError("");
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    handleVerify(fullCode);
  };

  useEffect(() => {
    if (!userId) {
      router.push("/register");
    }
  }, [userId, router]);

  if (!userId) {
    return null;
  }

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

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="w-12 h-12 bg-[#377749]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#377749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
              Verify your email
            </h1>
            <p className="text-[#555C56]">
              We&apos;ve sent a 6-digit verification code to your email address. Enter it below to verify your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#101928] text-center lg:text-left">
                Verification Code
              </label>
              <div className="flex justify-center lg:justify-start gap-2 sm:gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={verifyMutation.isPending}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold rounded-xl border border-[#D0D5DD] bg-white text-[#101928] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyMutation.isPending || code.join("").length !== 6}
              className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {verifyMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center space-y-2">
            <p className="text-sm text-[#555C56]">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResend}
              disabled={!canResend || resendMutation.isPending}
              className="text-sm font-semibold text-[#3C8350] hover:text-[#377749] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#3C8350]"
            >
              {resendMutation.isPending
                ? "Sending..."
                : canResend
                ? "Resend Code"
                : `Resend in ${countdown}s`}
            </button>
          </div>

          {/* Back to Register */}
          <div className="flex items-center justify-center gap-2 text-sm pt-4 border-t border-[#E5E7EB]">
            <span className="text-[#555C56]">Wrong email?</span>
            <Link href="/register" className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors">
              Register again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}