interface StrokeWidthSelectorProps {
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

const StrokeWidthSelector: React.FC<StrokeWidthSelectorProps> = ({
  strokeWidth,
  setStrokeWidth,
}) => {
  const strokeWidthOptions = [1, 2, 3];

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Stroke Width</h3>
      <div className="flex space-x-2">
        {strokeWidthOptions.map((width) => (
          <button
            type="button"
            key={width}
            className={`w-8 h-8 flex items-center justify-center border rounded-md ${
              strokeWidth === width
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-accent"
            }`}
            onClick={() => setStrokeWidth(width)}
          >
            {width}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StrokeWidthSelector;
