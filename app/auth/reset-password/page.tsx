import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password - FloodGuard",
  description: "Reset your FloodGuard password",
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ResetPasswordForm />
    </div>
  )
}
