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

const Toolbar = ({
  setTool,
  clearCanvas,
  activeTool,
}: {
  setTool: (tool: string) => void;
  clearCanvas: () => void;
  activeTool: string;
}) => {
  const buttonClass =
    "hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded";

  const getActiveClass = (tool: string) =>
    activeTool === tool ? "bg-blue-500" : "bg-gray-700";

  return (
    <div className="flex justify-center items-center bg-gray-800 space-x-2 rounded p-4">
      <button
        onClick={() => setTool("select")}
        className={`${getActiveClass("select")} ${buttonClass}`}
        aria-label="Select Tool"
      >
        <MousePointer />
      </button>
      <button
        onClick={() => setTool("rectangle")}
        className={`${getActiveClass("rectangle")} ${buttonClass}`}
        aria-label="Rectangle Tool"
      >
        <Square />
      </button>
      <button
        onClick={() => setTool("ellipse")}
        className={`${getActiveClass("ellipse")} ${buttonClass}`}
        aria-label="Ellipse Tool"
      >
        <Circle />
      </button>
      <button
        onClick={() => setTool("line")}
        className={`${getActiveClass("line")} ${buttonClass}`}
        aria-label="Line Tool"
      >
        <Minus />
      </button>
      <button
        onClick={() => setTool("arrow")}
        className={`${getActiveClass("arrow")} ${buttonClass}`}
        aria-label="Arrow Tool"
      >
        <MoveRight />
      </button>
      <button
        onClick={() => setTool("text")}
        className={`${getActiveClass("text")} ${buttonClass}`}
        aria-label="Text Tool"
      >
        <Type />
      </button>
      <button
        onClick={() => setTool("pen")}
        className={`${getActiveClass("pen")} ${buttonClass}`}
        aria-label="Pen Tool"
      >
        <Pen />
      </button>
      <button
        onClick={() => clearCanvas()}
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
