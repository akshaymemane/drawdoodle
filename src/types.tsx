export type ToolType =
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "pen";

export type Element = {
  id: string;
  tool: ToolType; // e.g., "rectangle", "ellipse", "line", "text", "pen"
  x: number; // Top-left corner X
  y: number; // Top-left corner Y
  endX: number; // Bottom-right corner X (for certain tools)
  endY: number; // Bottom-right corner Y (for certain tools)
  width: number; // Width of the element
  height: number; // Height of the element
  stroke: string; // Stroke color
  strokeWidth: number; // Thickness of the stroke
  strokeStyle: string; // Solid, dashed, etc.
  backgroundColor: string; // Fill color
  fillStyle: string; // Fill pattern/style (solid, crosshatch, etc.)
  penPath?: { x: number; y: number }[]; // For freehand drawing (pen tool)
  text?: string; // Text content (for text elements)
  fontSize?: number; // Font size (for text elements)
  fontFamily?: string; // Font family (for text elements)
  fontStyle?: "normal" | "italic" | "bold"; // Font style
  opacity?: number;
  rotation?: number; // Rotation in degrees (optional, default is 0)
};

export type Cursor = {
  id: string;
  x: number;
  y: number;
};

export interface TextElement {
  id: number;
  x: number;
  y: number;
  content: string;
  options: {
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
  };
}
