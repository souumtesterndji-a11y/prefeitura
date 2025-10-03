import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

const BLACKCAT_API_URL = "https://api.blackcatpagamentos.com/v1/transactions"
const PUBLIC_KEY = "pk_Ks8p5jHpgvrhWGcR0jGiQzYi5iY6qVbLge6gXaYCVv5pBBJX" // Replace with your Black Cat public key
const SECRET_KEY = "sk_vbktBHsmUtJZGDlDqsfOibii8H6jNSkjOw94TQgpPKECgu2F" // Replace with your Black Cat secret key

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, customerName, customerEmail, customerDocument } = body

    console.log("[v0] Creating Black Cat PIX payment:", {
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

    // Prepare request body according to Black Cat API
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
      ip: ip,
    }

    console.log("[v0] Black Cat request body:", JSON.stringify(requestBody, null, 2))

    // Make request to Black Cat API
    const response = await fetch(BLACKCAT_API_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Black Cat response status:", response.status)

    const responseText = await response.text()
    console.log("[v0] Black Cat response text:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Failed to parse Black Cat response as JSON:", e)
      return NextResponse.json(
        {
          error: "Invalid response from payment provider",
          details: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Black Cat response data:", JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create PIX payment",
          details: responseData,
        },
        { status: response.status },
      )
    }

    // Save payment to database
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
      qrCode: responseData.pix?.qrcode,
      pixCode: responseData.pix?.qrcode,
      expiresAt: responseData.pix?.expirationDate,
      amount: amount,
    })
  } catch (error) {
    console.error("[v0] Error creating Black Cat PIX:", error)
    return NextResponse.json(
      {
        error: "Failed to create PIX payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
