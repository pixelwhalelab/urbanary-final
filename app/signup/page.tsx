"use client";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

const SignupPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [phone, setPhone] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dob, setDob] = useState("");
  const [isDobValid, setIsDobValid] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const fetchCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const res = await fetch("/api/captcha");
      const data = await res.json();
      setCaptchaSvg(data.svg);
    } catch (err) {
      console.error("Error loading captcha:", err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/search");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingSpin(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, dob, password, captcha: captchaAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Email already registered") {
          let counter = 5;
          setErrorMsg(
            `Email already registered — redirecting to login in ${counter}s...`
          );
          setLoadingSpin(false);

          const interval = setInterval(() => {
            counter--;
            setErrorMsg(
              `Email already registered — redirecting to login in ${counter}s...`
            );
            if (counter === 0) {
              clearInterval(interval);
              router.push("/login");
            }
          }, 1000);

          return;
        }

        setErrorMsg(data.message || "Signup failed");
        setLoadingSpin(false);
        fetchCaptcha();
        setCaptchaAnswer("");
        return;
      }

      router.push(data.redirectUrl || "/verify-email");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoadingSpin(false);
    }
  };

  const validateDob = (date: string) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const isValid =
    isMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isEmailValid &&
    isDobValid;

  useEffect(() => {
    if (!isTyping) return;
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, [password, isTyping]);

  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultMaxDate = `${yyyy}-${mm}-${dd}`;
  const [maxDate] = useState(defaultMaxDate);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  useEffect(() => {
    setMounted(true);
  }, []);

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
            Welcome
          </p>
          <p className="text-center text-lg font-montserrat mt-1">
            Signup to create your account.
          </p>
          <form className="space-y-4 mt-3 px-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="flex justify-center space-x-3">
                <div className="relative w-1/3 justify-center">
                  <span className="absolute inset-y-0 left-2 flex items-center justify-center">
                    <img
                      src="/assets/gb.png"
                      alt="UK Flag"
                      className="h-4 w-6"
                    />
                  </span>
                  <input
                    name="CountryCode"
                    type="text"
                    value="+44"
                    readOnly
                    disabled
                    className="w-full mt-1 font-semibold pl-10 pr-3 py-2 border bg-stone-300 border-gray-300 rounded items-center"
                  />
                </div>
                <input
                  name="phone"
                  type="tel"
                  value={phone}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setPhone(onlyNums);
                  }}
                  inputMode="numeric"
                  className="w-2/3 mt-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth{" "}
                <span className="italic">(Must be 18 years or older)</span>
              </label>
              {mounted && (
                <>
                  <input
                    name="dob"
                    type="date"
                    max={maxDate}
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      setIsDobValid(validateDob(e.target.value));
                    }}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onKeyDown={(e) => e.preventDefault()}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded cursor-pointer appearance-none"
                  />
                  {!isDobValid && (
                    <span className="text-red-600 mt-1 block font-semibold">
                      You must be 18 years old to signup
                    </span>
                  )}
                </>
              )}
            </div>

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

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solve the CAPTCHA
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="border rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-urbanary hover:rotate-180 transition-transform cursor-pointer"
                >
                  {loadingCaptcha ? (
                    <RefreshCw className="animate-spin w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-white bg-red-600 p-2 rounded text-center font-semibold">
                Error : {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || loadingSpin || !captchaAnswer.trim()}
              className={`w-full text-white font-semibold py-3 px-4 rounded transition flex items-center justify-center gap-2 ${
                isValid && !loadingSpin && captchaAnswer.trim()
                  ? "bg-urbanary cursor-pointer"
                  : "bg-black opacity-50 cursor-not-allowed"
              }`}
            >
              {loadingSpin ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing up...
                </>
              ) : (
                "Signup"
              )}
            </button>

            <p className="text-black text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-urbanary font-semibold">
                Login
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

export default SignupPage;
