import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151511",
        paper: "#f5efe4",
        clay: "#b65b43",
        acid: "#d7ff45",
        fog: "#e6ded0",
      },
      boxShadow: {
        editorial: "0 24px 70px rgba(21, 21, 17, 0.16)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Bricolage Grotesque", "Avenir Next", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
