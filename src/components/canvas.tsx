import { Cursor, Element, TextElement, ToolType } from "@/types";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import Stylebar from "./Stylebar";
import Toolbar from "./Toolbar";
import { ControlPanel } from "./control-panel";
import { useHistory } from "./hooks/useHistory";
import { usePressedKeys } from "./hooks/usePressedKeys";
import useWebSocket from "./hooks/useWebSocket";
import { useTheme } from "./theme-provider";
import { drawArrow } from "./util/util";

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
  const [fontFamily, setFontFamily] = useState<string>("none");
  const [fontSize, setFontSize] = useState<string>("none");
  const [textAlignment, setTextAlignment] = useState<string>("none");
  const [opacity, setOpacity] = useState<number>(50);

  const [texts, setTexts] = useState<TextElement[]>([]);

  const [penPath, setPenPath] = useState<{ x: number; y: number }[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]); // State to store cursor positions
  const pressedKeys = usePressedKeys();
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const { sendMessage, lastMessage } = useWebSocket();

  //control panel
  const [scale, setScale] = useState(1);

  const { theme } = useTheme();

  const toolsWithSidebar = ["rectangle", "ellipse", "line", "arrow", "text"];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === "text") {
      const newText = {
        id: Date.now(), // Unique identifier
        x: e.clientX, // Click X position
        y: e.clientY, // Click Y position
        content: "", // Default text
        options: {
          fontFamily,
          fontSize,
          color: stroke,
          textAlign: textAlignment,
        },
      };

      setTexts((prev) => [...prev, newText]);
    }
  };

  const handleTextEdit = (id: number, newContent: string) => {
    setTexts((prev) =>
      prev.map((text) =>
        text.id === id ? { ...text, content: newContent } : text
      )
    );
  };

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
        strokeStyle, // Use strokeStyle from the element
        opacity,
      } = element;
      let options = {
        stroke,
        strokeWidth,
        fillStyle: fillStyle !== "none" ? fillStyle : undefined,
        fill: backgroundColor !== "none" ? backgroundColor : undefined,
        opacity: opacity ? opacity / 100 : 1,
      };

      // Set the line dash based on the element's strokeStyle
      if (strokeStyle === "dashed") {
        context.setLineDash([5, 15]);
      } else if (strokeStyle === "dotted") {
        context.setLineDash([5]);
      } else {
        context.setLineDash([]);
      }

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

    // // Render text elements
    // texts.forEach((text) => {
    //   const { x, y, content, options } = text;
    //   context.font = `${options.fontSize} ${options.fontFamily}`;
    //   context.fillStyle = options.color;
    //   context.textAlign = options.textAlign as CanvasTextAlign;
    //   context.fillText(content, x, y);
    // });

    // Draw the cursors of all connected clients
    // cursors.forEach((cursor) => {
    //   context.beginPath();
    //   context.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
    //   context.fillStyle = cursor.color || "blue";
    //   context.fill();
    // });
  };

  const clearCanvas = () => {
    setElements([]);
    setTexts([]);
    redraw();
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
    setScale((prevScale) => Math.min(Math.max(prevScale + delta, 0.5), 2));
  };

  useEffect(() => {
    redraw();
  }, [elements, currentElement, cursors]);

  return (
    <div>
      <div className="fixed top-0 left-0 w-full flex justify-center shadow-md p-4">
        <Toolbar
          activeTool={tool}
          setTool={setTool}
          clearCanvas={clearCanvas}
        />
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
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            textAlignment={textAlignment}
            setTextAlignment={setTextAlignment}
            opacity={opacity}
            setOpacity={setOpacity}
            activeTool={tool}
          />
        </div>
      )}
      <div className="flex-grow overflow-auto">
        {texts.map((text) => (
          <>
            <div
              key={text.id}
              style={{
                position: "absolute",
                left: text.x,
                top: text.y,
                cursor: "text",
                fontFamily: text.options.fontFamily,
                fontSize: text.options.fontSize,
                color: text.options.color,
              }}
            >
              {/* Editable input for text */}
              <input
                type="text"
                value={text.content}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: text.options.color,
                  fontSize: text.options.fontSize, // Adjust font size
                  width: "auto", // Expand based on content,
                  fontFamily: text.options.fontFamily,
                  textAlign: text.options.textAlign,
                }}
                onChange={(e) => handleTextEdit(text.id, e.target.value)} // Update the state
                autoFocus
              />
            </div>
          </>
        ))}

        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
};

export default Canvas;
