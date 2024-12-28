import React from "react";
import BackgroundSelector from "./selectors/BackgroundSelector";
import FillStyleSelector from "./selectors/FillStyleSelector";
import FontFamilySelector from "./selectors/FontFamilySelector";
import FontSizeSelector from "./selectors/FontSizeSelector";
import StrokeSelector from "./selectors/StrokeSelector";
import StrokeStyleSelector from "./selectors/StrokeStyleSelector";
import StrokeWidthSelector from "./selectors/StrokeWidthSelector";
import TextAlignmentSelector from "./selectors/TextAlignmentSelector";

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
  fontFamily: string;
  setFontFamily: (value: string) => void;
  fontSize: string;
  setFontSize: (value: string) => void;
  textAlignment: string;
  setTextAlignment: (value: string) => void;
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
      <StrokeStyleSelector
        strokeStyle={strokeStyle}
        setStrokeStyle={setStrokeStyle}
      />

      {/* Font Family Section */}
      <FontFamilySelector
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />

      {/* Font Size Section */}
      <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />

      {/* Text Alignment Section */}
      <TextAlignmentSelector
        textAlign={textAlignment}
        setTextAlign={setTextAlignment}
      />

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
