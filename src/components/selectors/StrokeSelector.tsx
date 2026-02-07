interface StrokeSelectorProps {
  stroke: string;
  setStroke: (stroke: string) => void;
}

const StrokeSelector: React.FC<StrokeSelectorProps> = ({
  stroke,
  setStroke,
}) => {
  const strokeColors = [
    { id: "white", color: "#ffffff" },
    { id: "orange", color: "#ff6f61" },
    { id: "green", color: "#48bb78" },
    { id: "blue", color: "#63b3ed" },
    { id: "yellow", color: "#ed8936" },
  ];

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Stroke</h3>
      <div className="flex space-x-2">
        {strokeColors.map((key) => (
          <button
            type="button"
            key={key.color}
            className={`w-8 h-8 cursor-pointer rounded border ${
              stroke === key.color ? "border-blue-500" : "border-border"
            }`}
            style={{ backgroundColor: key.color }}
            onClick={() => setStroke(key.color)}
            aria-label={`Stroke ${key.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default StrokeSelector;
