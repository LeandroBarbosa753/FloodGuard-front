import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth/reset-password", "/auth/callback"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If user is not signed in and the current path is not a public route,
  // redirect the user to /login
  if (!session && !isPublicRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is a public route (except for auth callbacks),
  // redirect the user to /dashboard
  if (session && isPublicRoute && !req.nextUrl.pathname.startsWith("/auth/")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
