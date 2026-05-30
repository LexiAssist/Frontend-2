/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { APIError, handleAPIError } from "@/lib/errorHandler";
import { Icon } from "@/components/Icon";
import Logo from "@/components/auth/Logo";
import Image from "next/image";
import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function SocialLoginButton({
  provider,
  label,
}: {
  provider: "google" | "linkedin";
  label: string;
}) {
  const iconSrc =
    provider === "google"
      ? "/images/google-icon-logo-svgrepo-com.svg"
      : "/images/linkedin-svgrepo-com.svg";

  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 h-12 px-4 sm:px-6 bg-white border border-[#E8E8E8] rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.985] transition-all duration-300 text-sm font-semibold text-[#555555]"
    >
      <div className="relative w-5 h-5 shrink-0">
        <Image
          src={iconSrc}
          alt={`${label} icon`}
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
      <span className="whitespace-nowrap hidden sm:inline">{label}</span>
      <span className="whitespace-nowrap sm:hidden">
        {provider === "google" ? "Google" : "LinkedIn"}
      </span>
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(() => {
    if (errorParam === "session_expired") {
      return "Your session has expired. Please log in again.";
    } else if (errorParam === "cleared") {
      return "Authentication was reset. Please log in again.";
    }
    return "";
  });

  const { login } = useAuth(redirectUrl || undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      await login(data);
    } catch (err) {
      const error = handleAPIError(err);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        const userId = error.data?.user_id as string | undefined;
        if (userId) {
          router.push(`/verify-email?userId=${userId}`);
          return;
        }
        setServerError(
          "Email verification required. Please check your email for the verification code."
        );
      } else if (error.statusCode === 401) {
        setServerError("Invalid email or password. Please try again.");
      } else if (error.statusCode === 403) {
        setServerError(
          "Access denied. Please contact support if you believe this is an error."
        );
      } else {
        setServerError(error.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAFAFA]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#EAF4EE] via-[#E4EFE8] to-[#C3D9C9] relative overflow-hidden items-center justify-center p-12">
        {/* Decorative Grid Mesh */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #3D7A52 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow Ambient Orbs */}
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-[#6B9E7C]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-[#3D7A52]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full">
          <div className="self-start">
            <Logo />
          </div>
          
          {/* Cupertino Showcase Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(45,90,61,0.06)] max-w-md mx-auto"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] text-[#3D7A52] flex items-center justify-center shadow-inner">
                <Brain className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#111111] text-lg tracking-tight">AI StudyBuddy</h3>
                <p className="text-xs font-bold text-[#6B9E7C] uppercase tracking-wider">LexiAssist Companion</p>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm font-semibold leading-relaxed mb-6">
              "Since I started using LexiAssist, my reading and writing confidence has soared. The personalized flashcards and real-time feedback are game-changers!"
            </p>
            
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <div className="w-10 h-10 rounded-full bg-[#3C8350] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-white/40">
                JC
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Jessica Chen</h4>
                <p className="text-xs font-semibold text-slate-400">Medical Student</p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-[#FFF9E6] border border-amber-200/50 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-700 uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>
          </motion.div>
          
          <div className="max-w-sm pl-4">
            <p className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Designed for Excellence</p>
            <p className="text-sm font-medium text-[#555555] mt-1.5 leading-relaxed">Elevate your learning potential with tailored interactive tools.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-3xl p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] text-[#111111]">
              Welcome Back
            </h1>
            <p className="text-sm font-semibold text-slate-400 leading-relaxed">Log into your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[13px] font-bold uppercase tracking-wider text-slate-400"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className="w-full h-12 px-4 bg-slate-50/50 hover:bg-slate-50/20 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#3D7A52]/10 focus:border-[#3D7A52] focus:bg-white transition-all duration-300 text-slate-800 font-medium"
              />
              {errors.email && (
                <p className="text-xs font-semibold text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-bold uppercase tracking-wider text-slate-400"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-[#3C8350] hover:text-[#2D5A3D] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 pr-12 bg-slate-50/50 hover:bg-slate-50/20 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#3D7A52]/10 focus:border-[#3D7A52] focus:bg-white transition-all duration-300 text-slate-800 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Icon name="eye-off" size={18} />
                  ) : (
                    <Icon name="eye" size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="text-xs font-bold text-red-700 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#3D7A52] to-[#2D5A3D] hover:from-[#3D7A52] hover:to-[#22452E] text-white font-bold rounded-xl shadow-md shadow-emerald-800/10 active:scale-[0.985] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <SocialLoginButton provider="google" label="Google" />
            <SocialLoginButton provider="linkedin" label="LinkedIn" />
          </div>

          {/* Register Link */}
          <div className="flex items-center justify-center gap-2 text-sm pt-2">
            <span className="text-[#555C56]">Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="font-bold text-[#3C8350] hover:text-[#2D5A3D] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}