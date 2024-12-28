import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaseSensitive,
  Code,
  PencilLine,
} from "lucide-react";
import React from "react";
import StrokeSelector from "./styles/StrokeSelector";

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

const fillStyleOptions = [
  "hachure",
  "solid",
  "zigzag",
  "cross-hatch",
  "dots",
  "dashed",
  "zigzag-line",
];

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
      <StrokeSelector stroke={stroke} setStroke={setStroke} />

      {/* Background Section */}
      <div>
        <h3 className="text-sm font-bold mb-2">Background</h3>
        <div className="flex space-x-2">
          {["transparent", "#805ad5", "#2d3748", "#4a5568", "#2f855a"].map(
            (color) => (
              <div
                key={color}
                className={`w-8 h-8 cursor-pointer border ${
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
        <h3 className="text-sm font-bold mb-2">Fill Style</h3>
        <div className="flex space-x-2">
          {["none", "#9f7aea", "#e2e8f0"].map((color) => (
            <div
              key={color}
              className={`w-8 h-8 cursor-pointer border ${
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
              {style === "solid" ? "—" : style === "dashed" ? "-" : "···"}
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
            className="p-3 border rounded hover:bg-gray-400 bg-gray-700"
          >
            <PencilLine size={20} />
          </button>
          <button
            onClick={() => setFontFamily("normal")}
            className="p-3 border rounded hover:bg-gray-400 bg-gray-700"
          >
            <CaseSensitive size={20} />
          </button>
          <button
            onClick={() => setFontFamily("code")}
            className="p-3 border rounded hover:bg-gray-400 bg-gray-700"
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
            className="px-4 py-2 border rounded hover:bg-gray-400 bg-gray-700"
          >
            S
          </button>
          <button
            onClick={() => setFontSize("medium")}
            className="px-4 py-2 border rounded hover:bg-gray-400 bg-gray-700"
          >
            M
          </button>
          <button
            onClick={() => setFontSize("large")}
            className="px-4 py-2 border rounded hover:bg-gray-400 bg-gray-700"
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
            className="px-3 py-2 border rounded hover:bg-gray-400 bg-gray-700"
          >
            <AlignLeft size={20} />
          </button>
          <button
            onClick={() => setTextAlignment("center")}
            className="px-3 py-2 border rounded hover:bg-gray-400 bg-gray-700"
          >
            <AlignCenter size={20} />
          </button>
          <button
            onClick={() => setTextAlignment("right")}
            className="px-3 py-2 border rounded hover:bg-gray-400 bg-gray-700"
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
