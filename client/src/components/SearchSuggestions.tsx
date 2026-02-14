import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../lib/api';
import { SearchSuggestion } from '../lib/types';

export default function SearchSuggestions({ query, onSelect }: { query: string; onSelect: (q: string) => void }) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShow(false);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(query);
        setSuggestions(data || []);
        setShow(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  if (!show || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
      {suggestions.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            setShow(false);
            navigate(`/books/${s.id}`);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
        >
          <p className="text-gray-100 text-sm font-medium">{s.title}</p>
          <p className="text-gray-400 text-xs">{s.author}</p>
        </button>
      ))}
    </div>
  );
}
