import { Circle, Minus, MoveRight, Square, Trash2 } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const Toolbar = ({
  setTool,
}: {
  setTool: any;
}) => {
  return (
    <div className="flex justify-center items-center w-[400px] bg-gray-400 space-x-2 rounded p-2">
      <button
        onClick={() => setTool("rectangle")}
        className="bg-gray-500 px-4 py-2 text-white rounded"
      >
        <Square />
      </button>
      <button
        onClick={() => setTool("ellipse")}
        className="bg-gray-500 px-4 py-2 text-white rounded"
      >
        <Circle />
      </button>
      <button
        onClick={() => setTool("line")}
        className="bg-gray-500 px-4 py-2 text-white rounded"
      >
        <Minus />
      </button>

      <button
        onClick={() => setTool("line")}
        className="bg-gray-500 px-4 py-2 text-white rounded"
      >
        <MoveRight />
      </button>

      <button className="bg-gray-500 px-4 py-2 text-white rounded">
        <Trash2 />
      </button>
      
      <ModeToggle />

    </div>

  );
};

export default Toolbar;
