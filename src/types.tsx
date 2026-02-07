export type DrawingTool =
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "pen";

export type ToolType = "select" | DrawingTool;

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type Point = {
  x: number;
  y: number;
};

export type Element = {
  id: string;
  tool: DrawingTool;
  x: number;
  y: number;
  width: number;
  height: number;
  endX: number;
  endY: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  backgroundColor: string;
  fillStyle: string;
  rotation: number;
  opacity: number;
  text?: {
    content: string;
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
    opacity: number;
  };
  penPath?: Point[];
  seed: number;
};

export type TextItem = {
  id: string;
  x: number;
  y: number;
  content: string;
  options: {
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
    opacity: number;
  };
};

export type Cursor = {
  id: string;
  x: number;
  y: number;
};
