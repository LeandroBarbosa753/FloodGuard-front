import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - FloodGuard",
  description: "Reset your FloodGuard password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ForgotPasswordForm />
    </div>
  )
}
