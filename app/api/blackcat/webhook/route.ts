import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Black Cat webhook received:", JSON.stringify(body, null, 2))

    // Black Cat webhook structure (adjust based on actual webhook format)
    const { id, status, transaction } = body

    if (status === "paid" || status === "completed") {
      console.log("[v0] Payment confirmed for transaction:", id)

      // Update payment status in database
      try {
        const supabase = await getSupabaseServerClient()
        const { error: updateError } = await supabase
          .from("payments")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("transaction_id", id)

        if (updateError) {
          console.error("[v0] Error updating payment status:", updateError)
        } else {
          console.log("[v0] Payment status updated successfully")
        }
      } catch (dbError) {
        console.error("[v0] Database error:", dbError)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing Black Cat webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
