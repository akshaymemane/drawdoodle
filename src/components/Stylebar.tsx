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
