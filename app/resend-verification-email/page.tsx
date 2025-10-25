"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";

const ResendVerificationEmailPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [loadingState, setLoadingState] = useState(false);
  const [message, setMessage] = useState("");
  const isValid = isEmailValid;

  useEffect(() => {
    if (!loading && user) {
      router.push("/search");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoadingState(true);
    setMessage("");

    try {
      const res = await fetch("/api/resend-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        let counter = 5;
        const redirectUrl = data.redirectUrl || "/verify-email";

        const isAlreadyVerified = redirectUrl === "/login";

        const messageText = isAlreadyVerified
          ? `${
              data.message || "Already verified"
            } — redirecting to login page in ${counter}s...`
          : `${
              data.message || "OTP sent"
            } — redirecting to verify email page in ${counter}s...`;

        setMessage(messageText);

        const interval = setInterval(() => {
          counter--;
          setMessage(
            isAlreadyVerified
              ? `${
                  data.message || "Already verified"
                } — redirecting to login page in ${counter}s...`
              : `${
                  data.message || "OTP sent"
                } — redirecting to verify email page in ${counter}s...`
          );

          if (counter === 0) {
            clearInterval(interval);
            router.push(redirectUrl);
          }
        }, 1000);
      } else {
        let counter: number;
        switch (res.status) {
          case 404:
            counter = 5;
            setMessage(
              `${
                data.message || "Email not registered"
              } — redirecting to signup in ${counter}s...`
            );
            const interval404 = setInterval(() => {
              counter--;
              setMessage(
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
          case 200:
            counter = 5;
            setMessage(
              `${
                data.message || "Already verified"
              } — redirecting to login in ${counter}s...`
            );
            const interval200 = setInterval(() => {
              counter--;
              setMessage(
                `${
                  data.message || "Already verified"
                } — redirecting to login in ${counter}s...`
              );
              if (counter === 0) {
                clearInterval(interval200);
                router.push(data.redirectUrl || "/login");
              }
            }, 1000);
            break;
          default:
            setMessage(data.message || "Something went wrong.");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
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
            Resend Email
          </p>
          <p className="text-center text-lg font-montserrat mt-1">
            We’ve sent a 6-digit code to your email. Enter it below to continue.
            If you don’t see the email in your inbox, please check your{" "}
            <strong>junk</strong> or <strong>spam</strong> folder.
          </p>
          <form className="space-y-4 mt-3 px-4" onSubmit={handleSubmit}>
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
            {message && (
              <p
                className={`p-2 rounded text-center font-semibold ${
                  message.toLowerCase().includes("otp sent") ||
                  message.toLowerCase().includes("already verified")
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {message}
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
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          </form>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default ResendVerificationEmailPage;
