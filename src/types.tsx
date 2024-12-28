export type ToolType =
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "pen";
export type Element = {
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

export type Cursor = {
  id: string;
  x: number;
  y: number;
};
