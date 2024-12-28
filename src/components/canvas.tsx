import { Cursor, Element, ToolType } from "@/types";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import Stylebar from "./Stylebar";
import Toolbar from "./Toolbar";
import { ControlPanel } from "./control-panel";
import { useHistory } from "./hooks/useHistory";
import { usePressedKeys } from "./hooks/usePressedKeys";
import useWebSocket from "./hooks/useWebSocket";
import { useTheme } from "./theme-provider";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { elements, setElements, undo, redo } = useHistory([]);

  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>("rectangle");
  const [stroke, setStroke] = useState("");
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [strokeStyle, setStrokeStyle] = useState<string>("solid");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [fillStyle, setFillStyle] = useState<string>("none");
  const [penPath, setPenPath] = useState<{ x: number; y: number }[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]); // State to store cursor positions
  const pressedKeys = usePressedKeys();
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const { sendMessage, lastMessage } = useWebSocket();

  //control panel
  const [scale, setScale] = useState(1);

  const { theme } = useTheme();

  const toolsWithSidebar = ["rectangle", "ellipse", "line", "arrow", "text"];

  useEffect(() => {
    setStroke(theme === "dark" ? "white" : "black");
  }, [theme]);

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
        backgroundColor,
        penPath,
      } = element;
      let options = {
        stroke,
        strokeWidth,
        fillStyle: fillStyle !== "none" ? fillStyle : undefined,
        fill: backgroundColor !== "none" ? backgroundColor : undefined,
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
    // cursors.forEach((cursor) => {
    //   context.beginPath();
    //   context.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
    //   context.fillStyle = "red"; // You can assign unique colors per cursor
    //   context.fill();
    // });
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

  //control panel

  useEffect(() => {
    const undoRedoFunction = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z") {
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (event.key === "y") {
          redo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const panOrZoomFunction = (event: WheelEvent) => {
      if (pressedKeys.has("Meta") || pressedKeys.has("Control")) {
        onZoom(event.deltaY * -0.01);
      } else {
        setPanOffset((prevState) => ({
          x: prevState.x - event.deltaX,
          y: prevState.y - event.deltaY,
        }));
      }
    };

    document.addEventListener("wheel", panOrZoomFunction);
    return () => {
      document.removeEventListener("wheel", panOrZoomFunction);
    };
  }, [pressedKeys]);

  const onZoom = (delta: number) => {
    setScale((prevState) => Math.min(Math.max(prevState + delta, 0.1), 20));
  };

  useEffect(() => {
    redraw();
  }, [elements, currentElement, cursors]);

  return (
    <div>
      <div className="fixed top-0 left-0 w-full flex justify-center shadow-md p-4">
        <Toolbar setTool={setTool} clearCanvas={clearCanvas} />
      </div>
      <div className="flex fixed gap-10 bottom-2 left-2 p-2">
        <ControlPanel
          undo={undo}
          redo={redo}
          onZoom={onZoom}
          scale={scale}
          setScale={setScale}
        />
      </div>
      {toolsWithSidebar.includes(tool) && (
        <div className="fixed top-1/2 left-0 -translate-y-1/2 shadow-md p-4">
          <Stylebar
            stroke={stroke}
            setStroke={setStroke}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeStyle={strokeStyle}
            setStrokeStyle={setStrokeStyle}
            fillStyle={fillStyle}
            setFillStyle={setFillStyle}
          />
        </div>
      )}
      <div className="flex-grow overflow-auto">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default Canvas;
