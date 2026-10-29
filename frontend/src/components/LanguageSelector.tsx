import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check, Search } from "lucide-react";
import { useLanguage, INDIAN_LANGUAGES, LanguageOption } from "../hooks/useLanguage";

interface LanguageSelectorProps {
  variant?: "dark" | "light";
  className?: string;
}

export default function LanguageSelector({
  variant = "dark",
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lang: LanguageOption) => {
    setLanguage(lang.code);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isDark = variant === "dark";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150 cursor-pointer ${
          isDark
            ? "bg-[#1F2937] hover:bg-[#374151] text-amber-300 border border-slate-700 shadow-xs"
            : "bg-white hover:bg-slate-50 text-[#002147] border border-slate-300 shadow-xs"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Portal Language"
      >
        <Globe size={13} className={isDark ? "text-amber-400" : "text-[#002147]"} />
        <span className="font-bold">{currentLang.native}</span>
        <span className="opacity-70 text-[10px] hidden sm:inline">({currentLang.name})</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu with Scroller */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-white shadow-elevated border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
          {/* Header */}
          <div className="bg-[#002147] text-white px-3.5 py-2.5 border-b border-navy-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Globe size={13} />
                <span>Select Language</span>
              </span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-200">
                22 Official
              </span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              AICTE Anuvadini &amp; Bhashini Translation Support
            </div>
          </div>

          {/* Quick Filter Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search language / भाषा खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-7 pr-2.5 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Language List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 py-1 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No matching language found
              </div>
            ) : (
              filteredLanguages.map((l) => {
                const isSelected = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l)}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 text-[#002147] font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{l.native}</span>
                      <span className="text-[11px] text-slate-500">({l.name})</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-amber-600 stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-500 text-center">
            Recognized 8th Schedule Languages of India
          </div>
        </div>
      )}
    </div>
  );
}

