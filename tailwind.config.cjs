/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    variants: {
      extend: {
        fontWeight: ["responsive", "hover", "focus"],
        opacity: ["hover"],
        borderColor: ["hover", "focus"],
        margin: ["first", "last"],
        backgroundColor: ["odd", "even"],
        scale: ["hover", "active", "group-hover"],
      },
    },
    extend: {
      colors: {
        "hot-purple": "#2e026d",
        "hot-pink": "hsl(280,100%,70%)",
        "transparent-black": "#00000080",
      },
    },
  },
  plugins: [],
};
