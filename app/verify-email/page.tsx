"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavigationHeader from "@/components/NavigationHeader";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

interface OtpInputProps {
  length?: number;
  onChangeOtp: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onChangeOtp }) => {
  const [otpArray, setOtpArray] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);
    onChangeOtp(newOtp.join(""));

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, length)
      .split("");
    const newOtp = [...otpArray];
    pastedData.forEach((char, i) => {
      if (i < length && /^[0-9]$/.test(char)) {
        newOtp[i] = char;
      }
    });
    setOtpArray(newOtp);
    onChangeOtp(newOtp.join(""));

    const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return (
    <div className="flex justify-between mt-1 w-full">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg sm:w-12 md:w-14"
        />
      ))}
    </div>
  );
};

const VerifyEmailPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = isEmailValid && otp.length === 6;
  const [loadingState, setLoadingState] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/search");
    }
  }, [user, loading, router]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoadingState(true);

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        let counter = 5;
        setErrorMsg(`Email verified — redirecting to login in ${counter}s...`);
        const interval = setInterval(() => {
          counter--;
          setErrorMsg(
            `Email verified — redirecting to login in ${counter}s...`
          );
          if (counter === 0) {
            clearInterval(interval);
            router.push(data.redirectUrl || "/login");
          }
        }, 1000);
      } else {
        let counter: number;
        switch (res.status) {
          case 404:
            counter = 5;
            setErrorMsg(
              `${
                data.message || "Email not registered"
              } — redirecting to signup in ${counter}s...`
            );
            const interval404 = setInterval(() => {
              counter--;
              setErrorMsg(
                `${
                  data.message || "Email not registered"
                } — redirecting to signup in ${counter}s...`
              );
              if (counter === 0) {
                clearInterval(interval404);
                router.push("/signup");
              }
            }, 1000);
            break;

          case 410:
            counter = 5;
            setErrorMsg(
              `${
                data.message || "OTP expired"
              } — redirecting to resend verification in ${counter}s...`
            );
            const interval410 = setInterval(() => {
              counter--;
              setErrorMsg(
                `${
                  data.message || "OTP expired"
                } — redirecting to resend verification in ${counter}s...`
              );
              if (counter === 0) {
                clearInterval(interval410);
                router.push("/resend-verification-email");
              }
            }, 1000);
            break;

          case 400:
            setErrorMsg(data.message || "Invalid OTP.");
            break;

          default:
            setErrorMsg(data.message || "Something went wrong.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Please try again later.");
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
            Verify Your Email
          </p>

          <p className="text-center text-lg font-montserrat mt-1">
            We’ve sent a 6-digit code to your email. Enter it below to continue.
            If you don’t see the email in your inbox, please check your{" "}
            <strong>junk</strong> or <strong>spam</strong> folder.
          </p>
          <form className="space-y-4 mt-3 px-4" onSubmit={handleVerifyEmail}>
            {/* Email */}
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
                <span className="text-red-600 mt-1 block font-semibold">
                  {!isEmailValid && "Invalid email format"}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <OtpInput length={6} onChangeOtp={setOtp} />
              {otp.length > 0 && otp.length < 6 && (
                <span className="text-red-600 mt-1 block font-semibold">
                  6 digits are required
                </span>
              )}
            </div>
            {errorMsg && (
              <p
                className={`p-2 rounded text-center font-semibold ${
                  errorMsg.includes("Email verified")
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {errorMsg}
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
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
            <p className="text-black text-center">
              Didn’t receive the verification email?{" "}
              <Link
                href="/resend-verification-email"
                className="text-urbanary font-semibold"
              >
                Resend it
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

export default VerifyEmailPage;
