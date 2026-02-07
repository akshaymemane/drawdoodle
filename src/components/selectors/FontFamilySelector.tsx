import { CaseSensitive, PenLine, Type } from "lucide-react";
import React from "react";

interface FontFamilySelectorProps {
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
}

const fontFamilies = [
  { id: "Caveat", label: "Hand", icon: PenLine },
  { id: "Patrick Hand", label: "Sketch", icon: CaseSensitive },
  { id: "monospace", label: "Mono", icon: Type },
];

const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  fontFamily,
  setFontFamily,
}) => {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Font Family</h3>
      <div className="flex space-x-2">
        {fontFamilies.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setFontFamily(item.id)}
              className={`p-3 border rounded-md ${
                fontFamily === item.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-accent"
              }`}
            >
              <Icon size={16} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FontFamilySelector;
