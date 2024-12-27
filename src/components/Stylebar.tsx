import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaseSensitive,
  Code,
  PencilLine,
} from "lucide-react";
import React from "react";

interface StylebarProps {
  stroke: string;
  setStroke: (value: string) => void;
  strokeWidth: number;
  setStrokeWidth: (value: number) => void;
  strokeStyle: string;
  setStrokeStyle: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  fillStyle: string;
  setFillStyle: (value: string) => void;
  fontFamily: "handdrawn" | "normal" | "code";
  setFontFamily: (value: "handdrawn" | "normal" | "code") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (value: "small" | "medium" | "large") => void;
  textAlignment: "left" | "center" | "right";
  setTextAlignment: (value: "left" | "center" | "right") => void;
}

const Stylebar: React.FC<StylebarProps> = ({
  stroke,
  setStroke,
  strokeWidth,
  setStrokeWidth,
  strokeStyle,
  setStrokeStyle,
  backgroundColor,
  setBackgroundColor,
  fillStyle,
  setFillStyle,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlignment,
  setTextAlignment,
}) => {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md space-y-4">
      {/* Stroke Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Stroke</h3>
        <div className="flex space-x-2">
          {["#ffffff", "#ff6f61", "#48bb78", "#63b3ed", "#ed8936"].map(
            (color) => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full cursor-pointer border ${
                  stroke === color ? "border-blue-500" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setStroke(color)}
              />
            )
          )}
        </div>
      </div>

      {/* Background Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Background</h3>
        <div className="flex space-x-2">
          {["transparent", "#805ad5", "#2d3748", "#4a5568", "#2f855a"].map(
            (color) => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full cursor-pointer border ${
                  backgroundColor === color
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBackgroundColor(color)}
              />
            )
          )}
        </div>
      </div>

      {/* Fill Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Fill</h3>
        <div className="flex space-x-2">
          {["none", "#9f7aea", "#e2e8f0"].map((color) => (
            <div
              key={color}
              className={`w-8 h-8 rounded-full cursor-pointer border ${
                fillStyle === color ? "border-blue-500" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFillStyle(color)}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <h3 className="text-sm font-bold mb-2">Stroke Width</h3>
        <div className="flex space-x-2">
          {[1, 2, 3].map((width) => (
            <button
              key={width}
              className={`w-8 h-8 flex items-center justify-center border rounded ${
                strokeWidth === width ? "bg-blue-500 text-white" : "bg-gray-700"
              }`}
              onClick={() => setStrokeWidth(width)}
            >
              {width}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style */}
      <div>
        <h3 className="text-sm font-bold mb-2">Stroke Style</h3>
        <div className="flex space-x-2">
          {["solid", "dashed", "dotted"].map((style) => (
            <button
              key={style}
              className={`w-8 h-8 flex items-center justify-center border rounded ${
                strokeStyle === style ? "bg-blue-500 text-white" : "bg-gray-700"
              }`}
              onClick={() => setStrokeStyle(style)}
            >
              {style === "solid" ? "—" : style === "dashed" ? "- -" : "···"}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Font Family</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFontFamily("handdrawn")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <PencilLine size={20} />
          </button>
          <button
            onClick={() => setFontFamily("normal")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <CaseSensitive size={20} />
          </button>
          <button
            onClick={() => setFontFamily("code")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <Code size={20} />
          </button>
        </div>
      </div>

      {/* Font Size Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Font Size</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFontSize("small")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            S
          </button>
          <button
            onClick={() => setFontSize("medium")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            M
          </button>
          <button
            onClick={() => setFontSize("large")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            L
          </button>
        </div>
      </div>

      {/* Text Alignment Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Text Align</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTextAlignment("left")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <AlignLeft size={20} />
          </button>
          <button
            onClick={() => setTextAlignment("center")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <AlignCenter size={20} />
          </button>
          <button
            onClick={() => setTextAlignment("right")}
            className="p-2 border rounded hover:bg-gray-200"
          >
            <AlignRight size={20} />
          </button>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <h3 className="text-sm font-bold mb-2">Opacity</h3>
        <input
          type="range"
          min="0"
          max="100"
          className="w-full"
          onChange={(e) => console.log("Opacity changed:", e.target.value)}
        />
      </div>
    </div>
  );
};

export default Stylebar;
