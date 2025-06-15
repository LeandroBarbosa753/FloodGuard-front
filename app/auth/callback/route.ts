import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url))
  }

  // If no code is present, redirect to login
  if (!code) {
    console.error("No code present in callback")
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(sessionError.message)}`, request.url))
    }

    console.log("Successfully exchanged code for session")

    // Check if we need to create a profile for this user
    if (data?.user) {
      try {
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error checking profile:", profileError)
        }

        // If profile doesn't exist, create one
        // This will work because now the user is authenticated
        if (!profileData) {
          // Use RLS bypass for more reliable profile creation
          const { error: insertError } = await supabase.auth.admin.createUser({
            uuid: data.user.id,
            email: data.user.email,
            email_confirm: true,
            user_metadata: {
              full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || "",
              avatar_url: data.user.user_metadata.avatar_url || "",
            },
          })

          if (insertError) {
            console.error("Error creating profile via admin API:", insertError)

            // Fallback to direct insert with authenticated user
            const { error: directInsertError } = await supabase.from("profiles").insert({
              id: data.user.id,
              name: data.user.user_metadata.full_name || data.user.user_metadata.name || data.user.email,
              avatar_url: data.user.user_metadata.avatar_url,
              updated_at: new Date().toISOString(),
            })

            if (directInsertError) {
              console.error("Error creating profile directly:", directInsertError)
            } else {
              console.log("Created new profile for user:", data.user.id)
            }
          } else {
            console.log("Created new user and profile via admin API:", data.user.id)
          }
        }
      } catch (profileCreationError) {
        console.error("Error in profile creation process:", profileCreationError)
        // Continue with the flow even if profile creation fails
      }
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Exception in auth callback:", error)
    return NextResponse.redirect(new URL("/login?error=auth_exception", request.url))
  }
}
