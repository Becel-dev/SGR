import { getParameter } from "./azure-table-storage";
import type { IerParameter, IerRule } from "./types";

// Cache para as regras de IER para evitar buscas repetidas no banco de dados
let ierRulesCache: IerRule[] | null = null;

const defaultIerRules: IerRule[] = [
  { min: 0, max: 199, label: 'BAIXO', color: '#a7f3d0' },
  { min: 200, max: 499, label: 'GERENCIÁVEL', color: '#fef08a' },
  { min: 500, max: 799, label: 'PRIORITÁRIO', color: '#fbbf24' },
  { min: 800, max: 1000, label: 'CRÍTICO', color: '#ef4444' },
];

/**
 * Busca as regras de IER, utilizando um cache para otimizar.
 * Se não encontrar regras no banco, retorna as regras padrão.
 */
export async function getIerRules(): Promise<IerRule[]> {
  if (ierRulesCache) {
    return ierRulesCache;
  }

  try {
    const parameter = await getParameter<IerParameter>('ierRules');
    if (parameter && parameter.rules && parameter.rules.length > 0) {
      ierRulesCache = parameter.rules;
      return parameter.rules;
    }
  } catch (error) {
    console.error("Erro ao buscar regras de IER, usando valores padrão:", error);
  }

  // Retorna as regras padrão se nada for encontrado ou em caso de erro
  return defaultIerRules;
}

/**
 * Determina a classificação e a cor de um IER com base nas regras dinâmicas.
 * @param ierValue O valor do IER a ser classificado.
 * @param rules As regras de IER a serem usadas para classificação.
 * @returns Um objeto com a label e a cor correspondente, ou valores padrão.
 */
export function getIerClassification(ierValue: number, rules: IerRule[]): { label: string; color: string } {
  const value = Math.round(ierValue); // Arredonda para o inteiro mais próximo
  
  const rule = rules.find(r => value >= r.min && value <= r.max);

  if (rule) {
    return { label: rule.label, color: rule.color };
  }

  // Retorno padrão caso nenhuma regra seja encontrada
  return { label: 'N/A', color: '#d1d5db' }; // gray-400
}
