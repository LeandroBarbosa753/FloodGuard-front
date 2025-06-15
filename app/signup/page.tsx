import { SignupForm } from "@/components/auth/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Signup - FloodGuard",
  description: "Create a new FloodGuard account",
}

export default function SignupPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignupForm />
    </div>
  )
}
