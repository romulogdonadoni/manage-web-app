/** Exibição de valores em BRL — sempre 2 casas decimais (ex.: R$ 5,00). */
export function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Valor numérico do API → string para input (sem arredondar). */
export function moneyToInput(value: number): string {
  if (!Number.isFinite(value)) return ""
  return String(value)
}

/** Converte input do usuário em número (aceita vírgula). */
export function parseMoneyInput(value: string): number {
  const n = Number(value.replace(",", ".").trim())
  return Number.isFinite(n) ? n : 0
}
