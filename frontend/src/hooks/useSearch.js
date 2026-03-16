import { useMemo, useState } from 'react';

export const useSearch = (items, keys) => {
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }
    return items.filter((item) =>
      keys.some((key) => String(item[key] || '').toLowerCase().includes(normalizedQuery))
    );
  }, [items, keys, query]);

  return { query, setQuery, filteredItems };
};

export default useSearch;
