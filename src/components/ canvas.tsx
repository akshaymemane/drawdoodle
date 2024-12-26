import { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar";
import { useTheme } from "./theme-provider";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [elements, setElements] = useState<any[]>([]); // Array to hold finalized elements
  const [currentElement, setCurrentElement] = useState<any>(null); // To track the current element being drawn
  const [drawing, setDrawing] = useState(false); // Flag to track if drawing is in progress
  const [tool, setTool] = useState<"rectangle" | "ellipse" | "line" | "text">(
    "rectangle"
  );
  const [stroke, setStroke] = useState("");
  const { theme } = useTheme();

  const setShapeStrokeByTheme = () => {
    if (theme === "dark") {
      setStroke("white");
    } else if (theme === "light") {
      setStroke("black");
    } else {
      setStroke("white");
    }
  };

  // Handle the start of drawing (onMouseDown)
  const handleMouseDown = (event: any) => {
    setDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;

    // Initialize the current element with the starting position
    const element = {
      tool,
      x: offsetX,
      y: offsetY,
      endX: offsetX,
      endY: offsetY,
      width: 0,
      height: 0,
    };

    setCurrentElement(element);
  };

  // Update the current element's size as the mouse moves (onMouseMove)
  const handleMouseMove = (event: any) => {
    if (!drawing) return;
    const { offsetX, offsetY } = event.nativeEvent;

    setCurrentElement((prev: any) => {
      const width = offsetX - prev.x;
      const height = offsetY - prev.y;
      return {
        ...prev,
        endX: offsetX,
        endY: offsetY,
        width,
        height,
      };
    });
  };

  // Finalize the drawing when the mouse is released (onMouseUp)
  const handleMouseUp = () => {
    if (!drawing) return;

    setDrawing(false);

    // Add the current element to the list of elements (finalize it)
    if (currentElement) {
      setElements((prevElements) => [...prevElements, currentElement]);
      setCurrentElement(null); // Reset the current element
    }
  };

  // Redraw all elements and the current element in progress
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Initialize rough.js canvas for drawing
    const roughCanvas = rough.canvas(canvas);

    // Clear the canvas before drawing anything
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all finalized elements (from `elements` array)
    elements.forEach((element) => {
      console.log("element: ", element);
      const { tool, x, y, width, height, endX, endY } = element;
      if (tool === "rectangle") {
        roughCanvas.rectangle(x, y, width, height, { stroke: stroke });
      } else if (tool === "ellipse") {
        roughCanvas.ellipse(x + width / 2, y + height / 2, width, height, {
          stroke: stroke,
        });
      } else if (tool === "line") {
        roughCanvas.line(x, y, endX, endY, { stroke: stroke });
      }
    });

    // Draw the current in-progress element (if any)
    if (currentElement) {
      const { tool, x, y, endX, endY, width, height } = currentElement;
      if (tool === "line") {
        roughCanvas.line(x, y, endX, endY, { stroke: stroke });
      } else if (tool === "rectangle") {
        roughCanvas.rectangle(x, y, width, height, { stroke: stroke });
      } else if (tool === "ellipse") {
        roughCanvas.ellipse(x + width / 2, y + height / 2, width, height, {
          stroke: stroke,
        });
      }
    }
  };

  // Redraw whenever `elements` or `currentElement` changes
  useEffect(() => {
    setShapeStrokeByTheme();
    redraw();
  }, [elements, currentElement]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-center items-center shadow-md p-4">
        <Toolbar setTool={setTool} />
      </div>

      {/* Canvas */}
      <div className="flex-grow overflow-auto">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 mx-auto mt-4"
          width={2000}
          height={1000}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default Canvas;
