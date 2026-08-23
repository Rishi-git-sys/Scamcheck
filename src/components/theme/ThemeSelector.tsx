"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex bg-muted-custom border border-subtle rounded-xl p-1 gap-1">
        <div className="px-3.5 py-1.5 text-xs font-medium text-secondary-color rounded-lg">
          Light
        </div>
        <div className="px-3.5 py-1.5 text-xs font-medium text-secondary-color rounded-lg">
          Dark
        </div>
        <div className="px-3.5 py-1.5 text-xs font-medium text-secondary-color rounded-lg">
          System
        </div>
      </div>
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className="inline-flex bg-muted-custom border border-subtle rounded-xl p-1 gap-1"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
              isSelected
                ? "bg-card border border-subtle text-primary-color shadow-soft font-medium"
                : "text-secondary-color hover:text-primary-color"
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
