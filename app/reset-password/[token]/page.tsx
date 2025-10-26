"use client";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavigationHeader from "@/components/NavigationHeader";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useParams } from "next/navigation";

import { useAuth } from "@/app/hooks/useAuth";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const path = usePathname();
  const token = path.split("/").pop();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingState, setLoadingState] = useState(false);

  const isMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  useEffect(() => {
    if (!loading && user) {
      router.push("/search");
    }
  }, [user, loading, router]);

  const isPasswordValid =
    isMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const isPasswordMatch =
    password === confirmPassword && confirmPassword !== "";

  const isValid = isPasswordValid && isPasswordMatch;

  useEffect(() => {
    if (!isTyping) return;
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, [password, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setErrorMsg("Invalid reset token.");

    setLoadingState(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setErrorMsg(data.message || "Failed to reset password.");
      }

      let counter = 5;
      setSuccessMsg(`${data.message} Redirecting in ${counter}s...`);
      const interval = setInterval(() => {
        counter--;
        setSuccessMsg(`${data.message} Redirecting in ${counter}s...`);
        if (counter === 0) {
          clearInterval(interval);
          router.push(data.redirectUrl || "/login");
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-urbanary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <NavigationHeader />
      <div className="bg-[#f7f7f7] bg-[url('/assets/slider.jpg')] bg-cover bg-center px-4 py-15 items-center justify-center flex text-black appearance-none">
        <div className="w-lg px-4 py-10 bg-white rounded-lg justify-center">
          <p className="text-center text-2xl sm:text-2xl md:text-4xl font-semibold font-montserrat">
            Reset Password
          </p>
          <p className="text-center text-lg font-montserrat mt-1">
            Enter your new password below. Make sure it meets the requirements
            and matches in both fields.
          </p>

          <form className="space-y-4 mt-3 px-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsTyping(true);
                  }}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div
                className={`mt-2 text-sm space-y-1 overflow-hidden transition-all duration-300 ${
                  isTyping ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div
                  className={isMinLength ? "text-green-600" : "text-red-600"}
                >
                  Minimum 8 characters
                </div>
                <div
                  className={hasUpperCase ? "text-green-600" : "text-red-600"}
                >
                  At least one uppercase letter
                </div>
                <div
                  className={hasLowerCase ? "text-green-600" : "text-red-600"}
                >
                  At least one lowercase letter
                </div>
                <div className={hasNumber ? "text-green-600" : "text-red-600"}>
                  At least one number
                </div>
                <div
                  className={hasSpecialChar ? "text-green-600" : "text-red-600"}
                >
                  At least one special character (!@#$%^&*)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {confirmPassword && !isPasswordMatch && (
                <span className="text-red-600 mt-1 block font-semibold">
                  Passwords do not match
                </span>
              )}
            </div>

            {errorMsg && (
              <p className="text-white bg-red-600 p-2 rounded text-center font-semibold">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-white bg-green-600 p-2 rounded text-center font-semibold">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full text-white font-semibold py-3 px-4 rounded transition ${
                isValid && !loading
                  ? "bg-urbanary cursor-pointer"
                  : "bg-black opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default ResetPasswordPage;
