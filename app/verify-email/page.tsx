"use client";
import { useState, useRef } from "react";
import Footer from "@/components/Footer";
import NavigationHeader from "@/components/NavigationHeader";
import Image from 'next/image';


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

const Page = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [otp, setOtp] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = isEmailValid && otp.length === 6;

  return (
    <>
      {/* Header */}
      <NavigationHeader />
      <div className="bg-[#f7f7f7] px-4 py-15 items-center justify-center flex text-black appearance-none">
        <div className="w-lg px-4 py-10 bg-white rounded-lg justify-center">
          <p className="text-center text-2xl sm:text-2xl md:text-4xl font-semibold font-montserrat">
            Verify Your Email
          </p>

          <p className="text-center text-lg font-montserrat mt-1">
            We’ve sent a 6-digit code to your email. Enter it below to continue.
            If you don’t see the email in your inbox, please check your{" "}
            <strong>junk</strong> or <strong>spam</strong> folder.
          </p>
          <form className="space-y-4 mt-3 px-4">
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

            <button
              type="submit"
              disabled={!isValid}
              className={`w-full text-white font-semibold py-3 px-4 rounded transition ${
                isValid
                  ? "bg-urbanary cursor-pointer"
                  : "bg-black opacity-50 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
            <p className="text-black text-center">
              Didn’t receive the verification email?{" "}
              <span className="text-urbanary font-semibold">Resend it</span>
            </p>
          </form>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default Page;
