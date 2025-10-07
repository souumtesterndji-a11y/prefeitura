"use client"

import { useState, useEffect } from "react"
import { Copy, Clock, Info, RefreshCw, CheckCircle, X, Bell } from "lucide-react"

interface PaymentData {
  transaction_id?: string
  qr_code?: string
  pix_code?: string
  amount: number
  status: string
}

interface CNPJData {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao: string
  endereco: {
    logradouro: string
    numero: string
    bairro: string
    municipio: string
    uf: string
    cep: string
  }
}

export default function PaymentPixPage() {
  const [timeLeft, setTimeLeft] = useState({ min: 14, seg: 55 })
  const [lastCheck, setLastCheck] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCopiedNotification, setShowCopiedNotification] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 248.79,
    status: "PENDING",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)

  useEffect(() => {
    const loadCNPJData = () => {
      const storedData = sessionStorage.getItem("cnpjData")
      if (storedData) {
        const data = JSON.parse(storedData)
        console.log("[v0] Loaded CNPJ data from session:", data)
        setCnpjData(data)
      }
    }

    const initializePayment = async () => {
      try {
        console.log("[v0] Initializing payment with Black Cat API")

        const response = await fetch("/api/blackcat/pix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: "248.79",
            customerName: cnpjData?.nome_fantasia || cnpjData?.razao_social || "Empresa Exemplo Ltda",
            customerEmail: "contato@empresa.com",
            customerDocument: cnpjData?.cnpj?.replace(/\D/g, "") || "12345678000190",
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Black Cat payment response:", JSON.stringify(data, null, 2))

          setPaymentData({
            transaction_id: data.transactionId,
            qr_code: data.qrCode,
            pix_code: data.pixCode,
            amount: Number.parseFloat(data.amount) || 248.79,
            status: data.status || "PENDING",
          })
        } else {
          const errorData = await response.json()
          console.error("[v0] Failed to initialize payment:", errorData)
        }
      } catch (error) {
        console.error("[v0] Payment initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCNPJData()
    initializePayment()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.min === 0 && prev.seg === 0) {
          window.location.reload()
          return prev
        }

        if (prev.seg === 0) {
          return { min: prev.min - 1, seg: 59 }
        } else {
          return { ...prev, seg: prev.seg - 1 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("pt-BR")
      setLastCheck(timeString)
    }

    const verifyPayment = async () => {
      if (!paymentData.transaction_id) return

      setIsVerifying(true)
      console.log("[v0] Verifying payment status with Black Cat")

      try {
        const response = await fetch(`/api/blackcat/status/${paymentData.transaction_id}`)
        if (response.ok) {
          const statusData = await response.json()
          console.log("[v0] Black Cat payment status:", statusData)

          setPaymentData((prev) => ({
            ...prev,
            status: statusData.status,
          }))

          if (statusData.status === "paid") {
            console.log("[v0] Payment completed!")
          }
        }
      } catch (error) {
        console.error("[v0] Status check error:", error)
      } finally {
        updateTime()
        setIsVerifying(false)
      }
    }

    updateTime()
    const interval = setInterval(verifyPayment, 30000)

    return () => clearInterval(interval)
  }, [paymentData.transaction_id])

  const copyPixCode = async () => {
    const pixCode =
      paymentData.pix_code ||
      "00020126580014BR.GOV.BCB.PIX01362481c019-cd81-41ef-bf73-6f150b118938520400005303986540248.795802BR5919PrefeituraMunicipal6009Sao Paulo62070503***63042DF9"

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pixCode)
        showSuccessNotification()
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = pixCode
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          showSuccessNotification()
        } else {
          alert("Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente.")
        }
      }
    } catch (err) {
      console.error("Erro ao copiar:", err)
      alert("Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente.")
    }
  }

  const showSuccessNotification = () => {
    setShowCopiedNotification(true)
    setPixCopied(true)

    setTimeout(() => {
      setShowCopiedNotification(false)
      setPixCopied(false)
    }, 4500)
  }

  const formatTime = (num: number) => num.toString().padStart(2, "0")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Inicializando pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {showCopiedNotification && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border-l-4 border-green-500 z-50 min-w-[280px] opacity-100 transition-all duration-300">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="font-semibold">Código PIX copiado com sucesso!</span>
          <button className="ml-auto p-1 hover:bg-gray-100 rounded" onClick={() => setShowCopiedNotification(false)}>
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div className="w-full h-full bg-green-500 animate-progress-countdown" />
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-white/20">
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
                <p className="text-sm font-medium text-gray-900">
                  {cnpjData?.nome_fantasia || cnpjData?.razao_social || "Empresa Exemplo"}
                </p>
                <p className="text-xs text-gray-600">CNPJ: {cnpjData?.cnpj || "12.345.678/0001-90"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                {(cnpjData?.nome_fantasia || cnpjData?.razao_social || "Empresa")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <p className="text-sm font-medium">
              Tempo restante para pagamento:
              <span className="font-bold ml-1">
                {formatTime(timeLeft.min)}:{formatTime(timeLeft.seg)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-2 mt-28">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20 opacity-100 transform translate-y-0 transition-all duration-500">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-gray-600">Nome:</span>
              <p className="font-semibold text-gray-900">
                {cnpjData?.nome_fantasia || cnpjData?.razao_social || "Empresa Exemplo Ltda"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">CNPJ:</span>
              <p className="font-semibold text-gray-900">{cnpjData?.cnpj || "12.345.678/0001-90"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">Protocolo:</span>
              <p className="font-semibold text-blue-700">RF508082</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">Valor:</span>
              <p className="font-bold text-lg text-green-700">R$ {paymentData.amount.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">Vencimento:</span>
              <p className="font-semibold text-red-600">07/10/2025</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${paymentData.status === "paid" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}
                />
                <span
                  className={`font-semibold ${paymentData.status === "paid" ? "text-green-600" : "text-orange-600"}`}
                >
                  {paymentData.status === "paid" ? "Pago" : "Pendente"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-white/20 opacity-100 transform translate-y-0 transition-all duration-700">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pagamento via PIX</h2>
            <p className="text-gray-600 text-sm">Escaneie o QR Code ou copie o código PIX abaixo</p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
              <div className="w-48 h-48 bg-white rounded border flex items-center justify-center">
                {paymentData.pix_code ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.pix_code)}`}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.log(
                          "[v0] QR Code generation failed for PIX code:",
                          paymentData.pix_code?.substring(0, 50),
                        )
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <div className="hidden text-center text-gray-500">
                      <div className="w-32 h-32 bg-gray-200 rounded mb-2 mx-auto flex items-center justify-center">
                        QR Code
                      </div>
                      <p className="text-xs">Erro ao gerar QR Code</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-32 h-32 bg-gray-200 rounded mb-2 mx-auto flex items-center justify-center">
                      QR Code
                    </div>
                    <p className="text-xs">Carregando QR Code...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Código PIX:</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
              <div
                className="flex-1 font-mono text-xs text-gray-800 select-text overflow-hidden text-ellipsis whitespace-nowrap"
                id="pix-code"
              >
                {paymentData.pix_code ||
                  "00020126580014BR.GOV.BCB.PIX01362481c019-cd81-41ef-bf73-6f150b118938520400005303986540248.795802BR5919PrefeituraMunicipal6009Sao Paulo62070503***63042DF9"}
              </div>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" onClick={copyPixCode}>
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2 text-sm">Como pagar:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
                  <li>Abra o aplicativo do seu banco</li>
                  <li>Acesse a área PIX</li>
                  <li>Escaneie o QR Code ou cole o código PIX</li>
                  <li>Confirme o valor de R$ {paymentData.amount.toFixed(2).replace(".", ",")}</li>
                  <li>Conclua o pagamento</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm">
              <RefreshCw className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
              Verificar
            </button>

            {!pixCopied ? (
              <button
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                onClick={copyPixCode}
              >
                <Copy className="w-4 h-4" />
                <span>Copiar PIX</span>
              </button>
            ) : (
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>PIX Copiado!</span>
              </button>
            )}
          </div>

          <div className="text-center">
            {!isVerifying ? (
              <div className="text-sm text-gray-600">
                <p className="mb-1">Verificação automática a cada 30 segundos</p>
                <p>
                  Última verificação: <span className="font-medium">{lastCheck}</span>
                </p>
                {paymentData.transaction_id && (
                  <p className="text-xs text-gray-500 mt-1">ID da transação: {paymentData.transaction_id}</p>
                )}
              </div>
            ) : (
              <div className="text-sm text-blue-600">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando pagamento...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
