import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Try a simple query to check connectivity
    const { data, error } = await supabase.from("sensors").select("count").limit(1)

    if (error) {
      console.error("Supabase health check error:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection error",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Connected to Supabase successfully",
    })
  } catch (error) {
    console.error("Health check exception:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
