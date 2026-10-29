/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F2B48",
          dark: "#08192C",
          light: "#1C4472",
          surface: "#F0F4F9",
        },
        brand: {
          DEFAULT: "#1D5288",
          hover: "#153E68",
          subtle: "#EAF1F8",
        },
        saffron: {
          DEFAULT: "#E8871E",
          bright: "#FF9933",
          light: "#FFF4E6",
        },
        govgreen: {
          DEFAULT: "#138808",
          dark: "#0E6406",
          light: "#E8F5E9",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#FDF8E2",
          dark: "#996515",
        },
        panel: "#F4F6F9",
      },
      fontFamily: {
        sans: [
          "Inter",
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 2px 6px 0 rgba(15, 43, 72, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        elevated: "0 10px 25px -5px rgba(15, 43, 72, 0.12), 0 8px 10px -6px rgba(15, 43, 72, 0.04)",
      },
      borderRadius: {
        gov: "6px",
      },
    },
  },
  plugins: [],
};
