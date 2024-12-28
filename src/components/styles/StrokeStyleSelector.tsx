interface StrokeStyleSelectorProps {
  strokeStyle: string;
  setStrokeStyle: (strokeStyle: string) => void;
}

const StrokeStyleSelector: React.FC<StrokeStyleSelectorProps> = ({
  strokeStyle,
  setStrokeStyle,
}) => {
  const strokeStyles = ["solid", "dashed", "dotted"];

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Stroke Style</h3>
      <div className="flex space-x-2">
        {strokeStyles.map((style) => (
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
  );
};

export default StrokeStyleSelector;
