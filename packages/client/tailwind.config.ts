import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      // Keyframes used by shadcn-ui components like Accordion and Collapsible
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
