import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaseSensitive,
  Code,
  PencilLine,
} from "lucide-react";
import React from "react";
import BackgroundSelector from "./styles/BackgroundSelector";
import FillStyleSelector from "./styles/FillStyleSelector";
import StrokeSelector from "./styles/StrokeSelector";
import StrokeWidthSelector from "./styles/StrokeWidthSelector";

interface StylebarProps {
  stroke: string;
  setStroke: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  strokeWidth: number;
  setStrokeWidth: (value: number) => void;
  strokeStyle: string;
  setStrokeStyle: (value: string) => void;
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
      <StrokeSelector stroke={stroke} setStroke={setStroke} />

      {/* Background Section */}
      <BackgroundSelector
        background={backgroundColor}
        setBackground={setBackgroundColor}
      />

      {/* Fill Section */}
      <FillStyleSelector fillStyle={fillStyle} setFillStyle={setFillStyle} />

      {/* Stroke Width */}
      <StrokeWidthSelector
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />

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
