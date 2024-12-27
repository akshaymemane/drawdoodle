import { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import Stylebar from "./Stylebar";
import Toolbar from "./Toolbar";
import { useTheme } from "./theme-provider";

type ToolType = "rectangle" | "ellipse" | "line" | "arrow" | "text" | "pen";
type Element = {
  tool: ToolType;
  x: number;
  y: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: string;
  backgroundColor: string;
  fillStyle: string;
  penPath?: { x: number; y: number }[]; // Add penPath for the Pen tool
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>("rectangle");
  const [stroke, setStroke] = useState("");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeStyle, setStrokeStyle] = useState<string>("solid");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [fillStyle, setFillStyle] = useState<string>("none");
  const [penPath, setPenPath] = useState<{ x: number; y: number }[]>([]);

  const { theme } = useTheme();

  const toolsWithSidebar = ["rectangle", "ellipse", "line", "arrow", "text"]; // Tools that should trigger the sidebar

  useEffect(() => {
    setStroke(theme === "dark" ? "white" : "black");
  }, [theme]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;

    if (tool === "pen") {
      // Start a new pen path if the tool is "pen"
      setCurrentElement({
        tool,
        x: offsetX,
        y: offsetY,
        endX: offsetX,
        endY: offsetY,
        width: 0,
        height: 0,
        stroke,
        strokeWidth,
        strokeStyle,
        backgroundColor,
        fillStyle,
        penPath: [{ x: offsetX, y: offsetY }], // Start the pen path
      });
    } else {
      setCurrentElement({
        tool,
        x: offsetX,
        y: offsetY,
        endX: offsetX,
        endY: offsetY,
        width: 0,
        height: 0,
        stroke,
        strokeWidth,
        strokeStyle,
        backgroundColor,
        fillStyle,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentElement) return;
    const { offsetX, offsetY } = event.nativeEvent;

    if (tool === "pen") {
      // If drawing with the pen tool, add points to the penPath
      setCurrentElement({
        ...currentElement,
        endX: offsetX,
        endY: offsetY,
        penPath: [
          ...currentElement.penPath!,
          { x: offsetX, y: offsetY }, // Add new point to penPath
        ],
      });
    } else {
      const width = offsetX - currentElement.x;
      const height = offsetY - currentElement.y;
      setCurrentElement({
        ...currentElement,
        endX: offsetX,
        endY: offsetY,
        width,
        height,
      });
    }
  };

  const handleMouseUp = () => {
    if (currentElement) {
      setElements((prev) => [...prev, currentElement]);
    }
    setCurrentElement(null);
    setDrawing(false);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const roughCanvas = rough.canvas(canvas);
    context.clearRect(0, 0, canvas.width, canvas.height);

    [...elements, currentElement].forEach((element) => {
      if (!element) return;
      const {
        tool,
        x,
        y,
        width,
        height,
        endX,
        endY,
        stroke,
        strokeWidth,
        fillStyle,
        penPath, // Extract penPath
      } = element;
      const options = {
        stroke,
        strokeWidth,
        fill: fillStyle !== "none" ? fillStyle : undefined,
      };

      switch (tool) {
        case "rectangle":
          roughCanvas.rectangle(x, y, width, height, options);
          break;
        case "ellipse":
          roughCanvas.ellipse(
            x + width / 2,
            y + height / 2,
            width,
            height,
            options
          );
          break;
        case "line":
          roughCanvas.line(x, y, endX, endY, options);
          break;
        case "arrow":
          drawArrow(roughCanvas, x, y, endX, endY, options);
          break;
        case "pen":
          if (penPath) {
            // Draw the pen path as a series of lines
            penPath.forEach((point, index) => {
              if (index > 0) {
                const prevPoint = penPath[index - 1];
                roughCanvas.line(
                  prevPoint.x,
                  prevPoint.y,
                  point.x,
                  point.y,
                  options
                );
              }
            });
          }
          break;
      }
    });
  };

  function drawArrow(
    rc: any,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: any
  ) {
    const headLength = 10;
    // Draw the main line
    rc.line(x1, y1, x2, y2, options);

    // Calculate the angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Calculate the points for the arrowhead
    const arrowPoint1 = {
      x: x2 - headLength * Math.cos(angle - Math.PI / 6),
      y: y2 - headLength * Math.sin(angle - Math.PI / 6),
    };

    const arrowPoint2 = {
      x: x2 - headLength * Math.cos(angle + Math.PI / 6),
      y: y2 - headLength * Math.sin(angle + Math.PI / 6),
    };

    // Draw the arrowhead
    rc.line(x2, y2, arrowPoint1.x, arrowPoint1.y, options);
    rc.line(x2, y2, arrowPoint2.x, arrowPoint2.y, options);
  }

  const clearCanvas = () => {
    setElements([]);
  };

  useEffect(() => {
    redraw();
  }, [elements, currentElement]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-center items-center shadow-md p-4">
        <Toolbar setTool={setTool} clearCanvas={clearCanvas} />
      </div>
      {toolsWithSidebar.includes(tool) && (
        <div className="fixed top-0 left-0 translate-y-1/2 shadow-md p-4">
          <Stylebar
            stroke={stroke}
            setStroke={setStroke}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeStyle={strokeStyle}
            setStrokeStyle={setStrokeStyle}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            fillStyle={fillStyle}
            setFillStyle={setFillStyle}
          />
        </div>
      )}
      <div className="flex-grow overflow-auto">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 mx-auto mt-4"
          width={1875}
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
