import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-xl transition-all duration-300 no-invert flex items-center justify-center shrink-0 border ${
        isDark 
          ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700 shadow-inner" 
          : "bg-white border-slate-200 text-blue-600 hover:bg-blue-50 shadow-sm"
      }`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
