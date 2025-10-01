import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cnpj } = body

    if (!cnpj) {
      return NextResponse.json({ error: "CNPJ is required" }, { status: 400 })
    }

    // Remove formatting from CNPJ
    const cleanCnpj = cnpj.replace(/\D/g, "")

    console.log("[v0] Checking payment status for CNPJ:", cleanCnpj)

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("cnpj", cleanCnpj)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("[v0] Error checking payment:", error)
      return NextResponse.json({ hasPaid: false })
    }

    const hasPaid = data && data.length > 0

    console.log("[v0] Payment check result:", { hasPaid, data })

    return NextResponse.json({
      hasPaid,
      payment: hasPaid ? data[0] : null,
    })
  } catch (error) {
    console.error("[v0] Error in check-payment:", error)
    return NextResponse.json({ hasPaid: false }, { status: 500 })
  }
}
