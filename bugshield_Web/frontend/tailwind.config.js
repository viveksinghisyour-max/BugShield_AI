export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shield: {
          blue: "#1d4ed8",
          navy: "#0f172a",
          slate: "#111827",
          green: "#22c55e",
        },
      },
      boxShadow: {
        glow: "0 18px 60px rgba(29, 78, 216, 0.18)",
      },
    },
  },
  plugins: [],
};
