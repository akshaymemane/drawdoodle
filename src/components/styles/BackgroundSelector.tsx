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
          <div
            key={key.color}
            className={`w-8 h-8 cursor-pointer border ${
              background === key.color
                ? "border-blue-500"
                : "border-transparent"
            }`}
            style={{ backgroundColor: key.color }}
            onClick={() => setBackground(key.color)}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundSelector;
