import { NextResponse } from "next/server"

const BILLIARDSPAY_API_URL = "https://api.billiardspay.com/v1/transactions"
const PUBLIC_KEY = "pk_gPprOUvafc_aRB4yutaFt2mQegX0CEEaZC5sksB2-4XUVZbT"
const SECRET_KEY = "sk_6ZNBSq5BnLTxXlFRs6h7ForMPRytCFslC9ofAZmFVB0exLq7"

export async function GET(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params

    console.log("[v0] Checking Billiards Pay transaction status:", transactionId)

    // Create Basic Auth header
    const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64")

    // Get transaction status from Billiards Pay
    const response = await fetch(`${BILLIARDSPAY_API_URL}/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    })

    console.log("[v0] Billiards Pay status response:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Billiards Pay status error:", errorText)
      return NextResponse.json(
        {
          error: "Failed to get transaction status",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Billiards Pay transaction data:", JSON.stringify(data, null, 2))

    // Map Billiards Pay status to our status
    // Billiards Pay statuses: waiting_payment, paid, refunded, canceled, failed
    const statusMap: Record<string, string> = {
      waiting_payment: "pending",
      paid: "paid",
      refunded: "refunded",
      canceled: "canceled",
      failed: "failed",
    }

    return NextResponse.json({
      transactionId: data.id,
      status: statusMap[data.status] || data.status,
      amount: data.amount / 100, // Convert cents to reais
      paidAt: data.paidAt,
      qrCode: data.pix?.qrcode,
      pixCode: data.pix?.qrcode,
    })
  } catch (error) {
    console.error("[v0] Error checking Billiards Pay status:", error)
    return NextResponse.json(
      {
        error: "Failed to check transaction status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
