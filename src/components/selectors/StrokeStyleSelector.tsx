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
            type="button"
            key={style}
            className={`w-14 h-8 text-xs flex items-center justify-center border rounded-md ${
              strokeStyle === style
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-accent"
            }`}
            onClick={() => setStrokeStyle(style)}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StrokeStyleSelector;
