"use client";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import { Eye, EyeOff } from "lucide-react";
import Image from 'next/image';


const page = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = isEmailValid;
  return (
    <>
      {/* Header */}
      <NavigationHeader />
      <div className="bg-[#f7f7f7] px-4 py-15 items-center justify-center flex text-black appearance-none">
        <div className="w-lg px-4 py-10 bg-white rounded-lg justify-center">
          <p className="text-center text-2xl sm:text-2xl md:text-4xl font-semibold font-montserrat">
            Forgot Password
          </p>
          <p className="text-center text-lg font-montserrat mt-1">
            Enter your email address. If you are already registered, a
            verification email will be sent to your account. If you don’t see
            the email in your inbox, please check your <strong>junk</strong> or{" "}
            <strong>spam</strong> folder.
          </p>

          <form className="space-y-4 mt-3 px-4">
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
          </form>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default page;
