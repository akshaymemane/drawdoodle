import React from "react";

interface FontSizeSelectorProps {
  fontSize: string;
  setFontSize: (fontSize: string) => void;
}

const fontSizes = [
  { id: "1rem", icon: "Small" },
  { id: "1.5rem", icon: "Medium" },
  { id: "2rem", icon: "Large" },
];

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  fontSize,
  setFontSize,
}) => {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Font Size</h3>
      <div className="flex space-x-2">
        {fontSizes.map((item) => {
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setFontSize(item.id)}
              className={`px-2 py-1 text-xs border rounded-md ${
                fontSize === item.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-accent"
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FontSizeSelector;
