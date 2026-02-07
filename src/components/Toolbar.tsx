import { ToolType } from "@/types";
import {
  Circle,
  Download,
  Minus,
  MousePointer,
  MoveRight,
  Pen,
  Square,
  Trash2,
  Type,
  X,
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
  deleteSelected = () => {},
  exportPng = () => {},
  hasSelection = false,
}: {
  setTool: (tool: ToolType) => void;
  clearCanvas: () => void;
  deleteSelected: () => void;
  exportPng: () => void;
  hasSelection: boolean;
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
    "inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors";

  const getActiveClass = (tool: Tool) =>
    activeTool === tool
      ? "bg-primary text-primary-foreground border-primary"
      : "";

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 rounded-lg border border-border bg-background/85 p-3 backdrop-blur-sm shadow-sm">
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
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block text-xs rounded border border-border bg-popover text-popover-foreground px-2 py-1">
            {name}
          </span>
        </div>
      ))}
      <button
        onClick={deleteSelected}
        className={`${buttonClass} ${!hasSelection ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Delete Selected"
        disabled={!hasSelection}
      >
        <X />
      </button>
      <button
        onClick={exportPng}
        className={buttonClass}
        aria-label="Export PNG"
      >
        <Download />
      </button>
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
