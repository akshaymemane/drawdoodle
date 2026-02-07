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
      <div className="grid grid-cols-2 gap-2">
        {fillStyleOptions.map((fill) => (
          <button
            type="button"
            key={fill.style}
            className={`w-full px-2 py-1 text-xs border rounded-md ${
              fillStyle === fill.style
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-accent"
            }`}
            onClick={() => setFillStyle(fill.style)}
            title={fill.style}
          >
            {fill.style.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FillStyleSelector;
