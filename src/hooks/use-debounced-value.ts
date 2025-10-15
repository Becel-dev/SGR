/**
 * Hook useDebouncedValue
 * 
 * Retorna um valor "debounced" que só atualiza após um delay sem mudanças.
 * Útil para otimizar filtros de busca e evitar re-renders excessivos.
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 * 
 * // debouncedSearch só atualiza 300ms após a última mudança em search
 */

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar timeout para atualizar o valor debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timeout se value mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
