import React from "react";

interface AicteLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark" | "navy" | "default";
}

/**
 * Official AICTE Emblem using the authentic Council Cogwheel & Diya logo
 */
export function AicteEmblem({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/aicte-logo.png"
      alt="All India Council for Technical Education Logo"
      width={size}
      height={size}
      className={`shrink-0 object-contain select-none drop-shadow-sm ${className}`}
      loading="eager"
    />
  );
}

/**
 * Official AICTE Bilingual Brand Header matching www.aicte.gov.in (Screenshot 1)
 */
export default function AicteLogo({
  size = 56,
  className = "",
  showText = true,
  variant = "default",
}: AicteLogoProps) {
  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <AicteEmblem size={size} />
      {showText && (
        <div className="flex flex-col justify-center">
          {/* Hindi Title (Screenshot 1: अखिल भारतीय तकनीकी शिक्षा परिषद) */}
          <div
            className={`text-base sm:text-lg md:text-xl font-bold font-devanagari tracking-wide leading-tight ${
              isLight ? "text-amber-300" : "text-[#1E293B]"
            }`}
          >
            अखिल भारतीय तकनीकी शिक्षा परिषद
          </div>

          {/* English Title (Screenshot 1: All India Council for Technical Education) */}
          <div
            className={`text-xs sm:text-sm md:text-base font-semibold tracking-tight leading-tight mt-0.5 ${
              isLight ? "text-white" : "text-[#334155]"
            }`}
          >
            All India Council for Technical Education
          </div>
        </div>
      )}
    </div>
  );
}
