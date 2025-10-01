import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cnpj = searchParams.get("cnpj")

  if (!cnpj) {
    return NextResponse.json({ error: "CNPJ é obrigatório" }, { status: 400 })
  }

  // Remove formatting from CNPJ
  const cleanCnpj = cnpj.replace(/\D/g, "")

  if (cleanCnpj.length !== 14) {
    return NextResponse.json({ error: "CNPJ deve ter 14 dígitos" }, { status: 400 })
  }

  try {
    console.log("[v0] Fetching CNPJ data for:", cleanCnpj)

    // Try ReceitaWS API first (free tier)
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; CNPJConsulta/1.0)",
      },
    })

    if (!response.ok) {
      console.log("[v0] ReceitaWS API failed, status:", response.status)
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] API Response received:", data.status)

    if (data.status === "ERROR") {
      return NextResponse.json(
        {
          error: data.message || "CNPJ não encontrado",
          details: "Verifique se o CNPJ está correto e tente novamente",
        },
        { status: 404 },
      )
    }

    // Transform the data to match our frontend expectations
    const transformedData = {
      cnpj: data.cnpj,
      razao_social: data.nome,
      nome_fantasia: data.fantasia || data.nome,
      situacao: data.situacao,
      data_abertura: data.abertura,
      atividade_principal: data.atividade_principal?.[0]?.text || "Não informado",
      endereco: {
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
      },
      telefone: data.telefone,
      email: data.email,
      capital_social: data.capital_social,
      porte: data.porte,
      natureza_juridica: data.natureza_juridica,
      // Add some mock regulatory data for demonstration
      anvisa: {
        status: data.situacao === "ATIVA" ? "IRREGULAR" : "PENDENTE",
        protocolo: `CTPS${Math.floor(Math.random() * 900000) + 100000}`,
        prazo_final: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        alvara_sanitario: "PENDENTE",
      },
    }

    console.log("[v0] Data transformed successfully")
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] Error fetching CNPJ data:", error)

    // Fallback: return mock data if API fails
    return NextResponse.json({
      cnpj: cleanCnpj,
      razao_social: "EMPRESA EXEMPLO LTDA",
      nome_fantasia: "Empresa Exemplo",
      situacao: "ATIVA",
      data_abertura: "01/01/2020",
      atividade_principal: "Atividades de consultoria em gestão empresarial",
      endereco: {
        logradouro: "RUA EXEMPLO",
        numero: "123",
        bairro: "CENTRO",
        municipio: "SÃO PAULO",
        uf: "SP",
        cep: "01000-000",
      },
      telefone: "(11) 99999-9999",
      email: "contato@exemplo.com.br",
      capital_social: "10000.00",
      porte: "MICRO EMPRESA",
      natureza_juridica: "Sociedade Empresária Limitada",
      anvisa: {
        status: "IRREGULAR",
        protocolo: `CTPS${Math.floor(Math.random() * 900000) + 100000}`,
        prazo_final: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        alvara_sanitario: "PENDENTE",
      },
      _fallback: true,
      _error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
