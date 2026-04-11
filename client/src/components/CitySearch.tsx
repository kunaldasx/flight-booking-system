import { useRef, useEffect, useMemo, useState } from "react";
import { Airport } from "@/types";

interface CitySearchProps {
  airports: { [key: string]: Airport };
  value: string;
  onChange: (cityCode: string) => void;
  placeholder?: string;
  label?: string;
}

export default function CitySearch({
  airports,
  value,
  onChange,
  placeholder = "Search city",
  label,
}: CitySearchProps) {
  const [inputValue, setInputValue] = useState(
    value && airports[value] ? `${airports[value].city} (${value})` : "",
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];
    return Object.values(airports)
      .filter(
        (airport) =>
          airport.city.toLowerCase().includes(query) ||
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [inputValue, airports]);

  const isOpen = suggestions.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    setInputValue(`${airport.city} (${airport.code})`);
    onChange(airport.code);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setHighlightedIndex(-1);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isOpen && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((airport, index) => (
              <div
                key={airport.code}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(airport)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium">{airport.city}</div>
                <div className="text-sm opacity-75">
                  {airport.code} · {airport.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
