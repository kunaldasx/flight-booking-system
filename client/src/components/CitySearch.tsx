import { useState, useRef, useEffect } from "react";
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
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter airports based on input
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = inputValue.toLowerCase();
    const filtered = Object.values(airports)
      .filter(
        (airport) =>
          airport.city.toLowerCase().includes(query) ||
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query),
      )
      .slice(0, 8); // Limit to 8 suggestions

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [inputValue, airports]);

  const handleSelect = (airport: Airport) => {
    setInputValue(`${airport.city} (${airport.code})`);
    onChange(airport.code);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && isOpen && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isOpen && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((airport, index) => (
              <div
                key={airport.code}
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
