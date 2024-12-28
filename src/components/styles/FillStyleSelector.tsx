interface FillStyleSelectorProps {
  fillStyle: string;
  setFillStyle: (fillStyle: string) => void;
}

const FillStyleSelector: React.FC<FillStyleSelectorProps> = ({
  fillStyle,
  setFillStyle,
}) => {
  const fillStyleOptions = [
    { id: 1, style: "hachure" },
    { id: 2, style: "solid" },
    { id: 3, style: "zigzag" },
    { id: 4, style: "cross-hatch" },
    { id: 5, style: "dots" },
    { id: 6, style: "dashed" },
    { id: 7, style: "zigzag-line" },
  ];

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Fill Style</h3>
      <div className="flex space-x-2">
        {fillStyleOptions.map((fill) => (
          <div
            key={fill.style}
            className={`w-8 h-8 flex items-center justify-center border rounded ${
              fillStyle === fill.style
                ? "bg-blue-500 text-white"
                : "bg-gray-700"
            }`}
            style={{ backgroundColor: fill.style }}
            onClick={() => setFillStyle(fill.style)}
          >
            {fill.id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FillStyleSelector;
