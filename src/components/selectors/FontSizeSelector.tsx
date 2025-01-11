import React from "react";

interface FontSizeSelectorProps {
  fontSize: string;
  setFontSize: (fontSize: string) => void;
}

const fontSizes = [
  { id: "1rem", icon: "S" },
  { id: "1.5rem", icon: "M" },
  { id: "2rem", icon: "L" },
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
              key={item.id}
              onClick={() => setFontSize(item.id)}
              className={`p-3 border rounded hover:bg-gray-400 bg-gray-700 ${
                fontSize === item.id ? "border-blue-500" : "border-transparent"
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
