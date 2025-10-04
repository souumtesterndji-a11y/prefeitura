"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface CnpjData {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao: string
  data_abertura: string
  atividade_principal: string
  endereco: {
    logradouro: string
    numero: string
    bairro: string
    municipio: string
    uf: string
    cep: string
  }
  telefone?: string
  email?: string
  capital_social?: string
  porte?: string
  natureza_juridica?: string
  anvisa: {
    status: string
    protocolo: string
    prazo_final: string
    alvara_sanitario: string
  }
  _fallback?: boolean
  _error?: string
}

export default function ResultsPage() {
  const [cnpj, setCnpj] = useState("")
  const [cnpjData, setCnpjData] = useState<CnpjData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Função para formatar a data como DD/MM/AAAA
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Mês é 0-indexed
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  // Data de hoje formatada
  const todayDate = formatDate(new Date())

  useEffect(() => {
    // Check if CNPJ exists in session storage
    const storedCnpj = sessionStorage.getItem("cnpj")
    if (!storedCnpj) {
      router.push("/")
      return
    }
    setCnpj(storedCnpj)

    const storedCnpjData = sessionStorage.getItem("cnpjData")
    if (storedCnpjData) {
      try {
        const parsedData = JSON.parse(storedCnpjData)
        setCnpjData(parsedData)
        console.log("[v0] Loaded CNPJ data from session:", parsedData)
      } catch (error) {
        console.error("[v0] Error parsing CNPJ data:", error)
      }
    }

    // Initialize Lucide icons if available
    if (typeof window !== "undefined" && (window as any).lucide) {
      ;(window as any).lucide.createIcons()
    }

    // Countdown timer
    const updateCountdown = () => {
      const now = new Date().getTime()
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999) // Define para o final do dia de hoje

      // Lógica de cálculo da distância CORRIGIDA e simplificada
      const distance = endOfToday.getTime() - now

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const hoursEl = document.getElementById("hours")
      const minutesEl = document.getElementById("minutes")
      const secondsEl = document.getElementById("seconds")

      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, "0")
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, "0")
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, "0")
    }

    const interval = setInterval(updateCountdown, 1000)
    updateCountdown()

    // Protection functions
    const showProtectionNotification = () => {
      console.log("Acesso negado - conteúdo protegido")
    }

    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      showProtectionNotification()
      return false
    }

    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

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

    const handleDragStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("dragstart", handleDragStart)

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

    return () => {
      clearInterval(interval)
      clearInterval(devToolsInterval)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("dragstart", handleDragStart)
    }
  }, [router])

  const handleRegularizar = () => {
    router.push("/darf")
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparando DARF</h2>
          <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-600">Gerando documento de arrecadação...</p>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .alert-gradient {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        }
        
        .warning-gradient {
            background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .slide-in {
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .countdown {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
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
      `}</style>

      <div
        className="min-h-screen bg-gray-50"
        onContextMenu={(e) => {
          e.preventDefault()
          return false
        }}
        onSelectStart={(e) => {
          e.preventDefault()
          return false
        }}
        onDragStart={(e) => {
          e.preventDefault()
          return false
        }}
      >
        {/* Header compacto */}
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
                <div className="text-right hidden md:block">
                  <p className="text-xs font-medium text-gray-900">{cnpjData?.razao_social || "CARREGANDO..."}</p>
                  <p className="text-xs text-gray-600">CNPJ: {cnpjData?.cnpj || cnpj}</p>
                </div>
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
                  {cnpjData?.razao_social
                    ? cnpjData.razao_social
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                    : "SJ"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Status crítico banner compacto */}
        <div className="alert-gradient text-white py-3 fixed top-12 left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-semibold text-sm">
                STATUS: {cnpjData?.anvisa.status || "VERIFICANDO"} - REGULARIZAÇÃO NECESSÁRIA
              </span>
            </div>
          </div>
        </div>

        {/* Container principal */}
        <main className="pt-24 pb-14 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Card principal do usuário - compacto */}
            <div className="glass-effect rounded-2xl p-6 mb-4 slide-in">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full gradient-bg mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                  {cnpjData?.razao_social
                    ? cnpjData.razao_social
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                    : "SJ"}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {cnpjData?.razao_social || "CARREGANDO DADOS..."}
                </h1>
                {cnpjData?.nome_fantasia && cnpjData.nome_fantasia !== cnpjData.razao_social && (
                  <p className="text-sm text-gray-600">Nome Fantasia: {cnpjData.nome_fantasia}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
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
                      className="w-4 h-4 text-blue-600"
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Data de Abertura</p>
                      <p className="font-semibold text-sm">{cnpjData?.data_abertura || "22/09/2025"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
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
                      className="w-4 h-4 text-gray-600"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Alvará Sanitário</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {cnpjData?.anvisa.alvara_sanitario || "PENDENTE"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
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
                      className="w-4 h-4 text-gray-600"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600">Situação Cadastral</p>
                      <p className="font-semibold text-sm text-gray-900">{cnpjData?.situacao || "IRREGULAR"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
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
                      className="w-4 h-4 text-red-600"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" x2="12" y1="8" y2="12"></line>
                      <line x1="12" x2="12.01" y1="16" y2="16"></line>
                    </svg>
                    <div>
                      <p className="text-xs text-red-600">CNPJ</p>
                      <p className="font-semibold text-red-700 text-sm">{cnpjData?.cnpj || cnpj}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do protocolo compactas */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="grid md:grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Protocolo</p>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg inline-block">
                      <p className="text-sm font-bold">{cnpjData?.anvisa.protocolo || "CTPS508082"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Prazo Final</p>
                    {/* Alterado para usar a data de hoje */}
                    <p className="text-sm font-bold countdown">{todayDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="text-sm font-bold text-red-600">{cnpjData?.anvisa.status || "CRÍTICO"}</p>
                  </div>
                </div>
              </div>

              {cnpjData?._fallback && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-yellow-800">
                      Dados simulados - API da Receita Federal temporariamente indisponível
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cards de alertas compactos */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              {/* Card de irregularidade compacto */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-orange-500 slide-in">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                      className="w-4 h-4 text-orange-600"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="m14.5 12.5-5 5"></path>
                      <path d="m9.5 12.5 5 5"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Irregularidade Detectada</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Identificamos problemas graves na sua <strong>Alvará Sanitário</strong>:
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li className="flex items-center space-x-1">
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
                          className="w-3 h-3 text-red-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="m15 9-6 6"></path>
                          <path d="m9 9 6 6"></path>
                        </svg>
                        <span>Pendente pagamento de taxa obrigatória</span>
                      </li>
                    </ul>
                    <div className="mt-2 p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-800">
                        <strong>Base Legal:</strong> Art. 1º da Lei nº 9.430/1996
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de consequências compacto */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-red-500 slide-in">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                      className="w-4 h-4 text-red-600"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Consequências Imediatas</h3>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                          <line x1="2" x2="22" y1="10" y2="10"></line>
                        </svg>
                        <span className="text-xs font-medium">
                          Multa até <strong>150%</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span className="text-xs font-medium">Bloqueio completo do CNPJ</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"></path>
                          <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"></path>
                          <path d="M10 10.5V6a2 2 0 0 0-2 2v8"></path>
                          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
                        </svg>
                        <span className="text-xs font-medium">Suspensão de benefícios</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                          <path d="M10 6h4"></path>
                          <path d="M10 10h4"></path>
                          <path d="M10 14h4"></path>
                          <path d="M10 18h4"></path>
                        </svg>
                        <span className="text-xs font-medium">Restrições bancárias</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                          <path d="M10 9H8"></path>
                          <path d="M16 13H8"></path>
                          <path d="M16 17H8"></path>
                        </svg>
                        <span className="text-xs font-medium">Bloqueio de documentos</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-red-50 rounded">
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
                          className="w-3 h-3 text-red-600"
                        >
                          <path d="M16 17h6v-6"></path>
                          <path d="m22 17-8.5-8.5-5 5L2 7"></path>
                        </svg>
                        <span className="text-xs font-medium">Inclusão no SERASA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown timer compacto */}
            <div className="glass-effect rounded-2xl p-4 mb-4 text-center">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Tempo Restante para Regularização</h3>
              <div id="countdown" className="flex justify-center space-x-3 text-xl font-bold">
                <div className="text-center">
                  <div id="hours" className="countdown">
                    08
                  </div>
                  <div className="text-xs text-gray-600">Horas</div>
                </div>
                <div className="text-center">
                  <div id="minutes" className="countdown">
                    00
                  </div>
                  <div className="text-xs text-gray-600">Minutos</div>
                </div>
                <div className="text-center">
                  <div id="seconds" className="countdown">
                    01
                  </div>
                  <div className="text-xs text-gray-600">Segundos</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Botão fixo compacto */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleRegularizar}
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
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>REGULARIZAR AGORA</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
