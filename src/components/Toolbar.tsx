import { ToolType } from "@/types";
import {
  Circle,
  Minus,
  MousePointer,
  MoveRight,
  Pen,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";

// Define a type for tools
type Tool =
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "pen";

const Toolbar = ({
  activeTool,
  setTool,
  clearCanvas,
}: {
  setTool: (tool: ToolType) => void;
  clearCanvas: () => void;
  activeTool: Tool;
}) => {
  // Tool configuration with explicit typing for 'name'
  const tools: { name: Tool; Icon: React.ComponentType }[] = [
    { name: "select", Icon: MousePointer },
    { name: "rectangle", Icon: Square },
    { name: "ellipse", Icon: Circle },
    { name: "line", Icon: Minus },
    { name: "arrow", Icon: MoveRight },
    { name: "text", Icon: Type },
    { name: "pen", Icon: Pen },
  ];

  // Shared button styling
  const buttonClass =
    "hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded";

  // Active tool styling
  const getActiveClass = (tool: Tool) =>
    activeTool === tool ? "bg-blue-500" : "bg-gray-700";

  return (
    <div className="flex justify-center items-center bg-gray-800 space-x-2 rounded p-4">
      {tools.map(({ name, Icon }) => (
        <button
          key={name}
          onClick={() => setTool(name)}
          className={`${getActiveClass(name)} ${buttonClass}`}
          aria-label={`${name} Tool`}
        >
          <Icon />
        </button>
      ))}
      <button
        onClick={clearCanvas}
        className={buttonClass}
        aria-label="Clear Canvas"
      >
        <Trash2 />
      </button>
      <ModeToggle />
    </div>
  );
};

export default Toolbar;
