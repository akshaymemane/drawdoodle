import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import React from "react";

interface TextAlignmentSelectorProps {
  textAlign: string;
  setTextAlign: (textAlign: string) => void;
}

const textAlignmentOptions = [
  { id: "left", icon: AlignLeft },
  { id: "center", icon: AlignCenter },
  { id: "right", icon: AlignRight },
];

const TextAlignmentSelector: React.FC<TextAlignmentSelectorProps> = ({
  textAlign,
  setTextAlign,
}) => {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Text Align</h3>
      <div className="flex space-x-2">
        {textAlignmentOptions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setTextAlign(item.id)}
              className={`p-3 border rounded-md ${
                textAlign === item.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-accent"
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

export default TextAlignmentSelector;
