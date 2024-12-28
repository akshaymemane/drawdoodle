import { CaseSensitive, Code, PencilLine } from "lucide-react"; // Import any icons you need
import React from "react";

interface FontFamilySelectorProps {
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
}

const fontFamilies = [
  { id: "small", icon: PencilLine },
  { id: "medium", icon: CaseSensitive },
  { id: "code", icon: Code },
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
          const Icon = item.icon; // Dynamically assign the icon component
          return (
            <button
              key={item.id}
              onClick={() => setFontFamily(item.id)}
              className={`p-3 border rounded hover:bg-gray-400 bg-gray-700 ${
                fontFamily === item.id
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FontFamilySelector;
