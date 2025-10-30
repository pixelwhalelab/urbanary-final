"use client";

import { Suspense } from "react";
import ResetPasswordPage from "./ResetPasswordPage";
import { Loader2 } from "lucide-react";


export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-urbanary" />
      </div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
