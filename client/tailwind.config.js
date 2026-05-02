export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#05050a",
        panel: "rgba(15, 18, 32, 0.72)",
        neonPink: "#ff2bd6",
        neonBlue: "#2de2ff",
        neonPurple: "#8b5cf6",
        caution: "#facc15"
      },
      boxShadow: {
        glow: "0 0 28px rgba(255, 43, 214, 0.22), 0 0 42px rgba(45, 226, 255, 0.14)",
        blueglow: "0 0 32px rgba(45, 226, 255, 0.2)"
      }
    }
  },
  plugins: []
};
