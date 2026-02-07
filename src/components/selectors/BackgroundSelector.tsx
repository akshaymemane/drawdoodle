interface BackgroundSelectorProps {
  background: string;
  setBackground: (background: string) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  background,
  setBackground,
}) => {
  const backgroundColors = [
    { id: "transparent", color: "none" },
    { id: "orange", color: "#ff6f61" },
    { id: "green", color: "#48bb78" },
    { id: "blue", color: "#63b3ed" },
    { id: "yellow", color: "#ed8936" },
  ];

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Background</h3>
      <div className="flex space-x-2">
        {backgroundColors.map((key) => (
          <button
            type="button"
            key={key.color}
            className={`w-8 h-8 cursor-pointer rounded border ${
              background === key.color
                ? "border-blue-500"
                : "border-border"
            }`}
            style={{
              backgroundColor: key.color === "none" ? "transparent" : key.color,
              backgroundImage:
                key.color === "none"
                  ? "linear-gradient(45deg,#d4d4d8 25%, transparent 25%), linear-gradient(-45deg,#d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)"
                  : undefined,
              backgroundSize: key.color === "none" ? "10px 10px" : undefined,
              backgroundPosition:
                key.color === "none" ? "0 0, 0 5px, 5px -5px, -5px 0px" : undefined,
            }}
            onClick={() => setBackground(key.color)}
            aria-label={`Background ${key.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundSelector;
