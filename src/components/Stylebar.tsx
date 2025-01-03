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
  backgroundColor,
  setBackgroundColor,
  strokeWidth,
  setStrokeWidth,
  strokeStyle,
  setStrokeStyle,
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
      <StrokeSelector stroke={stroke} setStroke={setStroke} />
      <BackgroundSelector
        background={backgroundColor}
        setBackground={setBackgroundColor}
      />
      <FillStyleSelector fillStyle={fillStyle} setFillStyle={setFillStyle} />
      <StrokeWidthSelector
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />
      <StrokeStyleSelector
        strokeStyle={strokeStyle}
        setStrokeStyle={setStrokeStyle}
      />
      <FontFamilySelector
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />
      <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
      <TextAlignmentSelector
        textAlign={textAlignment}
        setTextAlign={setTextAlignment}
      />
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
