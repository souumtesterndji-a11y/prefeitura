import { NextResponse } from "next/server"

const BLACKCAT_API_URL = "https://api.blackcatpagamentos.com/v1/transactions"
const PUBLIC_KEY = "pk_Ks8p5jHpgvrhWGcR0jGiQzYi5iY6qVbLge6gXaYCVv5pBBJX" // Replace with your Black Cat public key
const SECRET_KEY = "sk_vbktBHsmUtJZGDlDqsfOibii8H6jNSkjOw94TQgpPKECgu2F" // Replace with your Black Cat secret key

export async function GET(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params

    console.log("[v0] Checking Black Cat transaction status:", transactionId)

    // Create Basic Auth header
    const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64")

    // Get transaction status from Black Cat API
    const response = await fetch(`${BLACKCAT_API_URL}/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
    })

    console.log("[v0] Black Cat status response:", response.status)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to get transaction status",
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Black Cat transaction data:", JSON.stringify(data, null, 2))

    // Return formatted response
    return NextResponse.json({
      transactionId: data.id,
      status: data.status,
      qrCode: data.pix?.qrcode,
      pixCode: data.pix?.qrcode,
      amount: data.amount / 100, // Convert cents to reais
    })
  } catch (error) {
    console.error("[v0] Error checking Black Cat status:", error)
    return NextResponse.json(
      {
        error: "Failed to check transaction status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
