import {
  Circle,
  Minus,
  MousePointer,
  MoveRight,
  Pen,
  Square,
  Trash2,
  Type,
} from "lucide-react"; // Import Pointer icon
import { ModeToggle } from "./mode-toggle";

const Toolbar = ({
  setTool,
  clearCanvas,
}: {
  setTool: any;
  clearCanvas: any;
}) => {
  return (
    <div className="flex justify-center items-center bg-gray-800 space-x-2 rounded p-4">
      <button
        onClick={() => setTool("select")} // Set tool to "select"
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <MousePointer />
      </button>
      <button
        onClick={() => setTool("rectangle")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Square />
      </button>
      <button
        onClick={() => setTool("ellipse")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Circle />
      </button>
      <button
        onClick={() => setTool("line")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Minus />
      </button>
      <button
        onClick={() => setTool("arrow")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <MoveRight />
      </button>

      <button
        onClick={() => setTool("pen")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Type />
      </button>

      <button
        onClick={() => setTool("pen")}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Pen />
      </button>
      <button
        onClick={() => clearCanvas()}
        className="hover:bg-gray-400 bg-gray-700 px-4 py-2 text-white rounded"
      >
        <Trash2 />
      </button>
      <ModeToggle />
    </div>
  );
};

export default Toolbar;
