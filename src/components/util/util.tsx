import { Element } from "@/types";

export function getBoundingBox(element: Element): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const padding = 10; // Optional padding for rough elements

  switch (element.tool) {
    case "rectangle":
      return {
        x: element.x - padding,
        y: element.y - padding,
        width: element.width + padding * 2,
        height: element.height + padding * 2,
      };

    case "ellipse":
      return {
        x: element.x - element.width / 2 - padding,
        y: element.y - element.height / 2 - padding,
        width: element.width + padding * 2,
        height: element.height + padding * 2,
      };

    case "line":
      const linePoints = [
        { x: element.x, y: element.y },
        { x: element.endX, y: element.endY },
      ];
      const xs = linePoints.map((p) => p.x);
      const ys = linePoints.map((p) => p.y);
      return {
        x: Math.min(...xs) - padding,
        y: Math.min(...ys) - padding,
        width: Math.max(...xs) - Math.min(...xs) + padding * 2,
        height: Math.max(...ys) - Math.min(...ys) + padding * 2,
      };

    case "text":
      if (!element.text || !element.fontSize) {
        return { x: element.x, y: element.y, width: 0, height: 0 };
      }
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = `${element.fontStyle || "normal"} ${
          element.fontSize
        }px ${element.fontFamily || "Arial"}`;
        const textWidth = context.measureText(element.text).width;
        return {
          x: element.x - padding,
          y: element.y - padding,
          width: textWidth + padding * 2,
          height: element.fontSize + padding * 2,
        };
      }
      return { x: element.x, y: element.y, width: 0, height: 0 };

    case "pen":
      if (!element.penPath || element.penPath.length === 0) {
        return { x: element.x, y: element.y, width: 0, height: 0 };
      }
      const penXs = element.penPath.map((p) => p.x);
      const penYs = element.penPath.map((p) => p.y);
      return {
        x: Math.min(...penXs) - padding,
        y: Math.min(...penYs) - padding,
        width: Math.max(...penXs) - Math.min(...penXs) + padding * 2,
        height: Math.max(...penYs) - Math.min(...penYs) + padding * 2,
      };

    default:
      return {
        x: element.x - padding,
        y: element.y - padding,
        width: element.width + padding * 2,
        height: element.height + padding * 2,
      };
  }
}


export function drawArrow(
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