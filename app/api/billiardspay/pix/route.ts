import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

const BILLIARDSPAY_API_URL = "https://api.billiardspay.com/v1/transactions"
const PUBLIC_KEY = "pk_gPprOUvafc_aRB4yutaFt2mQegX0CEEaZC5sksB2-4XUVZbT"
const SECRET_KEY = "sk_6ZNBSq5BnLTxXlFRs6h7ForMPRytCFslC9ofAZmFVB0exLq7"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, customerName, customerEmail, customerDocument } = body

    console.log("[v0] Creating Billiards Pay PIX payment:", {
      amount,
      customerName,
      customerEmail,
      customerDocument,
    })

    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    console.log("[v0] Client IP:", ip)

    // Create Basic Auth header
    const auth = "Basic " + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString("base64")

    // Convert amount to cents (R$ 248.79 -> 24879)
    const amountInCents = Math.round(Number.parseFloat(amount) * 100)

    const documentType = customerDocument.length === 11 ? "cpf" : "cnpj"
    const customerType = customerDocument.length === 11 ? "individual" : "corporation"

    // Prepare request body according to Billiards Pay API
    const requestBody = {
      amount: amountInCents,
      paymentMethod: "pix",
      items: [
        {
          id: "ob-black",
          title: "OB BLACK",
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
        },
      ],
      customer: {
        name: customerName,
        email: customerEmail,
        document: {
          type: documentType,
          number: customerDocument,
        },
        type: customerType,
      },
      pix: {
        expiresIn: 3600, // 1 hour expiration
      },
      externalRef: `iptu-${Date.now()}`,
      metadata: "Pagamento de OB BLACK",
    }

    console.log("[v0] Billiards Pay request body:", JSON.stringify(requestBody, null, 2))

    // Make request to Billiards Pay API
    const response = await fetch(BILLIARDSPAY_API_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Billiards Pay response status:", response.status)

    const responseText = await response.text()
    console.log("[v0] Billiards Pay response text:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Failed to parse Billiards Pay response as JSON:", e)
      return NextResponse.json(
        {
          error: "Invalid response from payment provider",
          details: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Billiards Pay response data:", JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create PIX payment",
          details: responseData,
        },
        { status: response.status },
      )
    }

    try {
      const supabase = await getSupabaseServerClient()
      const { error: dbError } = await supabase.from("payments").insert({
        cnpj: customerDocument,
        ip_address: ip,
        amount: amountInCents,
        transaction_id: responseData.id,
        status: "pending",
        customer_name: customerName,
        customer_email: customerEmail,
      })

      if (dbError) {
        console.error("[v0] Error saving payment to database:", dbError)
      } else {
        console.log("[v0] Payment saved to database successfully")
      }
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
    }

    // Return formatted response
    return NextResponse.json({
      transactionId: responseData.id,
      status: responseData.status,
      qrCode: responseData.pix?.qrcode, // Billiards Pay uses lowercase "qrcode"
      pixCode: responseData.pix?.qrcode, // Use qrcode as pixCode for compatibility
      expiresAt: responseData.pix?.expirationDate,
      amount: amount,
    })
  } catch (error) {
    console.error("[v0] Error creating Billiards Pay PIX:", error)
    return NextResponse.json(
      {
        error: "Failed to create PIX payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
