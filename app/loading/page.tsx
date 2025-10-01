"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Shield, UserCheck, Search, CheckCircle } from "lucide-react"

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const steps = [
    {
      icon: UserCheck,
      title: "Verificando Identidade",
      subtitle: "Validando dados pessoais",
      color: "text-blue-500",
    },
    {
      icon: Search,
      title: "Analisando Situação",
      subtitle: "Verificando irregularidades",
      color: "text-purple-500",
    },
    {
      icon: CheckCircle,
      title: "Preparando Solução",
      subtitle: "Definindo próximas etapas",
      color: "text-green-500",
    },
  ]

  useEffect(() => {
    // Check if CNPJ exists in session storage
    const cnpj = sessionStorage.getItem("cnpj")
    if (!cnpj) {
      router.push("/")
      return
    }

    // Simulate loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          clearInterval(stepInterval)
          // Redirect to results after all steps complete
          setTimeout(() => {
            router.push("/results")
          }, 2000)
          return prev
        }
      })
    }, 2000)

    return () => clearInterval(stepInterval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-white/30 shadow-lg">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4 pt-20">
        <div className="max-w-4xl w-full mx-auto text-center">
          {/* Loading Spinner */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Processando Regularização</h1>
          <p className="text-lg text-gray-600 mb-2">Verificando dados fiscais...</p>
          <p className="text-sm text-gray-500 mb-12">Aguarde alguns instantes</p>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mb-12">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStep
              const isCurrent = index === currentStep

              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-6 shadow-lg border transition-all duration-500 ${
                    isActive ? "border-blue-200 shadow-blue-100" : "border-gray-200"
                  } ${isCurrent ? "scale-105" : ""}`}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isActive ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? step.color : "text-gray-400"}`} />
                  </div>
                  <h3 className={`font-semibold mb-2 ${isActive ? "text-gray-900" : "text-gray-500"}`}>{step.title}</h3>
                  <p className={`text-sm ${isActive ? "text-gray-600" : "text-gray-400"}`}>{step.subtitle}</p>

                  {isCurrent && (
                    <div className="mt-3">
                      <div className="flex justify-center">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Conexão Segura</h3>
            </div>
            <p className="text-sm text-gray-600">
              Seus dados estão sendo processados com segurança através de conexão criptografada. Este processo é
              necessário para sua regularização fiscal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
