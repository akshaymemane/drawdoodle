import { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import Stylebar from "./Stylebar";
import Toolbar from "./Toolbar";
import { useTheme } from "./theme-provider";
import useWebSocket from "./websocket";

type ToolType = "rectangle" | "ellipse" | "line" | "arrow" | "text" | "pen";
type Element = {
  id: string;
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
  penPath?: { x: number; y: number }[];
};

type Cursor = {
  id: string;
  x: number;
  y: number;
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
  const [cursors, setCursors] = useState<Cursor[]>([]); // State to store cursor positions

  const { sendMessage, lastMessage } = useWebSocket();

  const { theme } = useTheme();

  const toolsWithSidebar = ["rectangle", "ellipse", "line", "arrow", "text"];

  useEffect(() => {
    setStroke(theme === "dark" ? "white" : "black");
  }, [theme]);

  const data = {
    id: "61b411ba-ec6a-45b6-8b94-facd79173a11",
    tool: "rectangle",
    x: 574,
    y: 512,
    endX: 849,
    endY: 696,
    width: 275,
    height: 184,
    stroke: "white",
    strokeWidth: 2,
    strokeStyle: "solid",
    backgroundColor: "#ffffff",
    fillStyle: "none",
  };

  useEffect(() => {
    if (lastMessage) {
      let receivedData = lastMessage;

      // Handle element data
      if (receivedData.tool) {
        setElements((prev) => [...prev, receivedData]);
      }

      // Handle cursor data
      if (receivedData.type === "cursor") {
        // Update or add cursor position to state
        setCursors((prevCursors) => {
          const existingCursor = prevCursors.find(
            (cursor) => cursor.id === receivedData.id
          );
          if (existingCursor) {
            return prevCursors.map((cursor) =>
              cursor.id === receivedData.id
                ? { ...cursor, x: receivedData.x, y: receivedData.y }
                : cursor
            );
          } else {
            return [...prevCursors, receivedData];
          }
        });
      }
    }
  }, [lastMessage]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    const id = crypto.randomUUID(); // Generate unique ID for the element

    if (tool === "pen") {
      setCurrentElement({
        id,
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
        penPath: [{ x: offsetX, y: offsetY }],
      });
    } else {
      setCurrentElement({
        id,
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

    // Update cursor position to the server
    sendMessage(
      JSON.stringify({
        type: "cursor",
        id: "your-client-id", // Use unique ID for each client
        x: offsetX,
        y: offsetY,
      })
    );

    if (tool === "pen") {
      setCurrentElement({
        ...currentElement,
        endX: offsetX,
        endY: offsetY,
        penPath: [...currentElement.penPath!, { x: offsetX, y: offsetY }],
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
      sendMessage(JSON.stringify(currentElement)); // Send the new element to the server
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
        penPath,
      } = element;
      const options = {
        stroke,
        strokeWidth,
        fillStyle: "zigzag-line",
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

    // Draw the cursors of all connected clients
    cursors.forEach((cursor) => {
      context.beginPath();
      context.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
      context.fillStyle = "red"; // You can assign unique colors per cursor
      context.fill();
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
    rc.line(x1, y1, x2, y2, options);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowPoint1 = {
      x: x2 - headLength * Math.cos(angle - Math.PI / 6),
      y: y2 - headLength * Math.sin(angle - Math.PI / 6),
    };
    const arrowPoint2 = {
      x: x2 - headLength * Math.cos(angle + Math.PI / 6),
      y: y2 - headLength * Math.sin(angle + Math.PI / 6),
    };
    rc.line(x2, y2, arrowPoint1.x, arrowPoint1.y, options);
    rc.line(x2, y2, arrowPoint2.x, arrowPoint2.y, options);
  }

  const clearCanvas = () => {
    setElements([]);
    sendMessage(JSON.stringify({ type: "clear" })); // Notify all clients to clear their canvases
  };

  useEffect(() => {
    redraw();
  }, [elements, currentElement, cursors]);

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
