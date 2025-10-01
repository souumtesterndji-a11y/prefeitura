import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Billiards Pay webhook received:", JSON.stringify(body, null, 2))

    const { id, status, event } = body

    console.log("[v0] Transaction:", id, "Status:", status, "Event:", event)

    if (id && status) {
      try {
        const supabase = await getSupabaseServerClient()

        const updateData: any = {
          status: status === "paid" ? "paid" : status,
        }

        if (status === "paid") {
          updateData.paid_at = new Date().toISOString()
        }

        const { error: dbError } = await supabase.from("payments").update(updateData).eq("transaction_id", id)

        if (dbError) {
          console.error("[v0] Error updating payment in database:", dbError)
        } else {
          console.log("[v0] Payment status updated in database successfully")
        }
      } catch (dbError) {
        console.error("[v0] Database error:", dbError)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing Billiards Pay webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
