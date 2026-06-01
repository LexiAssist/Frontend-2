"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { APIError } from "@/lib/errorHandler";
import { Icon } from "@/components/Icon";
import Logo from "@/components/auth/Logo";
import Image from "next/image";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

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
      className="flex items-center justify-center gap-3 h-12 px-4 sm:px-6 bg-white border border-[#D0D5DD] rounded-full hover:bg-gray-50 hover:border-[#377749]/30 hover:shadow-sm active:scale-[0.98] transition-all duration-200 text-sm font-medium text-[#374151]"
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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      await registerUser(data);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.statusCode === 409) {
          setServerError("An account with this email already exists.");
        } else if (err.statusCode === 400) {
          setServerError(err.message || "Please check your details and try again.");
        } else {
          setServerError(err.message || "Registration failed. Please try again.");
        }
      } else {
        setServerError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#ECF3EE] relative items-center justify-center p-8">
        <div className="absolute top-8 left-8 z-10">
          <Logo />
        </div>
        <div className="absolute inset-0">
          <Image
            src="/images/Girl out the window.svg"
            alt="Girl looking out window"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-120 space-y-6 sm:space-y-8">
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#272A28]">
              Welcome to LexiAssist!
            </h1>
            <p className="text-[#555C56]">Register your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-[#101928]"
              >
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                {...register("first_name")}
                placeholder="Enter your first name"
                className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-[#101928]"
              >
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                {...register("last_name")}
                placeholder="Enter your last name"
                className="w-full h-12 px-4 rounded-full border border-[#D0D5DD] bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#377749]/20 focus:border-[#377749] transition-all duration-200 md:text-sm"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#101928]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className={`w-full h-12 px-4 rounded-full border ${
                  errors.email ? "border-red-500" : "border-[#D0D5DD]"
                } bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "focus:ring-red-500/20 focus:border-red-500"
                    : "focus:ring-[#377749]/20 focus:border-[#377749]"
                } transition-all duration-200 md:text-sm`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#101928]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a password (min 8 characters)"
                  className={`w-full h-12 px-4 pr-12 rounded-full border ${
                    errors.password ? "border-red-500" : "border-[#D0D5DD]"
                  } bg-white text-base text-[#101928] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "focus:ring-red-500/20 focus:border-red-500"
                      : "focus:ring-[#377749]/20 focus:border-[#377749]"
                  } transition-all duration-200 md:text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#667185] hover:text-[#101928] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Icon name="eye-off" size={18} />
                  ) : (
                    <Icon name="eye" size={18} />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              ) : (
                passwordValue.length > 0 && passwordValue.length < 8 && (
                  <p className="text-sm text-amber-600">
                    Password must be at least 8 characters
                  </p>
                )
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#377749] hover:bg-[#2d6340] active:bg-[#265538] text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-[#5D655F]">or</span>
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <SocialLoginButton provider="google" label="Google" />
            <SocialLoginButton provider="linkedin" label="LinkedIn" />
          </div>

          {/* Login Link */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#555C56]">Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-[#3C8350] hover:text-[#377749] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}