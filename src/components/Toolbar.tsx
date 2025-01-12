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

type Tool =
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "pen";

const Toolbar = ({
  activeTool = "select",
  setTool = () => {},
  clearCanvas = () => {},
}: {
  setTool: (tool: ToolType) => void;
  clearCanvas: () => void;
  activeTool: Tool;
}) => {
  const tools: { name: Tool; Icon: React.ComponentType }[] = [
    { name: "select", Icon: MousePointer },
    { name: "rectangle", Icon: Square },
    { name: "ellipse", Icon: Circle },
    { name: "line", Icon: Minus },
    { name: "arrow", Icon: MoveRight },
    { name: "text", Icon: Type },
    { name: "pen", Icon: Pen },
  ];

  const buttonClass =
    "hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded";

  const getActiveClass = (tool: Tool) =>
    activeTool === tool ? "bg-blue-500" : "bg-gray-700";

  return (
    <div className="flex justify-center items-center bg-gray-800 space-x-2 rounded p-4">
      {tools.map(({ name, Icon }) => (
        <div key={name} className="group relative">
          <button
            onClick={() => setTool(name)}
            className={`${getActiveClass(name)} ${buttonClass}`}
            aria-label={`${name} Tool`}
            aria-pressed={activeTool === name}
          >
            <Icon />
          </button>
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block text-sm bg-gray-700 text-white rounded px-2 py-1">
            {name}
          </span>
        </div>
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
