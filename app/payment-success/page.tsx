"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Home, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const [cnpj, setCnpj] = useState("")
  const [alreadyPaid, setAlreadyPaid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedCnpj = sessionStorage.getItem("cnpj")
    const wasAlreadyPaid = sessionStorage.getItem("alreadyPaid") === "true"

    if (!storedCnpj) {
      router.push("/")
      return
    }

    setCnpj(storedCnpj)
    setAlreadyPaid(wasAlreadyPaid)
  }, [router])

  const handleNewConsultation = () => {
    sessionStorage.clear()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-200 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" />
        <div
          className="absolute top-3/4 right-1/4 w-36 h-36 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-35 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/2 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4 pt-20">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border border-white/30 animate-in slide-in-from-bottom-4 duration-800">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {alreadyPaid ? "Sem Restrições" : "Pagamento Confirmado!"}
            </h1>
            <p className="text-gray-600">
              {alreadyPaid
                ? "Este CNPJ já está regularizado e não possui restrições."
                : "Sua restrição foi removida com sucesso"}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-800 font-medium mb-2">Status Atual:</p>
                <ul className="space-y-1 text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>CNPJ Regularizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Alvará Sanitário em Dia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Sem Pendências</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CNPJ Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <p className="text-blue-600 font-medium mb-1">CNPJ Consultado:</p>
              <p className="text-blue-800 font-bold text-lg">{cnpj}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleNewConsultation}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Nova Consulta
              </span>
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {alreadyPaid
                ? "Você pode realizar uma nova consulta a qualquer momento."
                : "Obrigado por regularizar sua situação."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
