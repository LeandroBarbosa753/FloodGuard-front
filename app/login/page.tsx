import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - FloodGuard",
  description: "Login to your FloodGuard account",
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <LoginForm />
    </div>
  )
}
