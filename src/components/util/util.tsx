import { Element } from "@/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Options } from "roughjs/bin/core";

export function getBoundingBox(element: Element): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const padding = 10;

  switch (element.tool) {
    case "rectangle":
    case "ellipse":
    case "text": {
      return {
        x: element.x - padding,
        y: element.y - padding,
        width: element.width + padding * 2,
        height: element.height + padding * 2,
      };
    }

    case "line":
    case "arrow": {
      const linePoints = [
        { x: element.x, y: element.y },
        { x: element.endX, y: element.endY },
      ];
      const xs = linePoints.map((point) => point.x);
      const ys = linePoints.map((point) => point.y);
      return {
        x: Math.min(...xs) - padding,
        y: Math.min(...ys) - padding,
        width: Math.max(...xs) - Math.min(...xs) + padding * 2,
        height: Math.max(...ys) - Math.min(...ys) + padding * 2,
      };
    }

    case "pen": {
      if (!element.penPath || element.penPath.length === 0) {
        return { x: element.x, y: element.y, width: 0, height: 0 };
      }
      const penXs = element.penPath.map((point) => point.x);
      const penYs = element.penPath.map((point) => point.y);
      return {
        x: Math.min(...penXs) - padding,
        y: Math.min(...penYs) - padding,
        width: Math.max(...penXs) - Math.min(...penXs) + padding * 2,
        height: Math.max(...penYs) - Math.min(...penYs) + padding * 2,
      };
    }

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
  rc: RoughCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: Options
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

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};



export const drawRoundedRectangle = (
  roughCanvas: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options: Options
) => {
  const path = `
    M ${x + radius} ${y}
    L ${x + width - radius} ${y}
    Q ${x + width} ${y}, ${x + width} ${y + radius}
    L ${x + width} ${y + height - radius}
    Q ${x + width} ${y + height}, ${x + width - radius} ${y + height}
    L ${x + radius} ${y + height}
    Q ${x} ${y + height}, ${x} ${y + height - radius}
    L ${x} ${y + radius}
    Q ${x} ${y}, ${x + radius} ${y}
    Z
  `;

  roughCanvas.path(path, options);
};

export const drawDiamond = (
  roughCanvas: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Options
) => {
  const path = `
    M ${x + width / 2} ${y}
    L ${x + width} ${y + height / 2}
    L ${x + width / 2} ${y + height}
    L ${x} ${y + height / 2}
    Z
  `;

  roughCanvas.path(path, options);
};
