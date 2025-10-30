"use client";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const [isTyping, setIsTyping] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [counter, setCounter] = useState(5);
  const [redirecting, setRedirecting] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const isValid =
    isMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isEmailValid;

  useEffect(() => {
    if (!loading && user) {
      router.push("/search");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isTyping) return;
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, [password, isTyping]);

  useEffect(() => {
    if (!redirecting) return;
    if (counter === 0) {
      router.push("/search");
      return;
    }

    const interval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [counter, redirecting, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingState(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed");
        return;
      }
      await refreshUser();
      setSuccessMsg(`Login Successful. Redirecting in ${counter}s...`);
      setRedirecting(true);

      const interval = setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 0;
          }
          setSuccessMsg(`Login Successful. Redirecting in ${prev - 1}s...`);
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (redirecting && counter > 0) {
      setSuccessMsg(`Login Successful. Redirecting in ${counter}s...`);
    }
  }, [counter, redirecting]);

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
            Welcome Back
          </p>
          <p className="text-center text-lg font-montserrat mt-1">
            Login to manage your account.
          </p>
          <form className="space-y-4 mt-3 px-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailValid(emailRegex.test(e.target.value));
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
              />
              {email && (
                <span className={`text-red-600 mt-1 block font-semibold`}>
                  {!isEmailValid && "Invalid email format"}
                </span>
              )}
            </div>

            <div>
              <div className="flex">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <div className="w-1/2 justify-end flex">
                  <Link
                    href="/forgot-password"
                    className="justify-end text-urbanary font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

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
              disabled={!isValid || loadingState}
              className={`w-full text-white font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2 ${
                isValid && !loadingState
                  ? "bg-urbanary cursor-pointer"
                  : "bg-black opacity-50 cursor-not-allowed"
              }`}
            >
              {loadingState ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            <p className="text-black text-center">
              Don't have an account yet?{" "}
              <Link href="/signup" className="text-urbanary font-semibold">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default LoginPage;
