import { Cursor, Element, Point, StrokeStyle, TextItem, ToolType } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rough from "roughjs/bin/rough";
import { Options } from "roughjs/bin/core";
import Stylebar from "./Stylebar";
import Toolbar from "./Toolbar";
import { ControlPanel } from "./control-panel";
import { useHistory } from "./hooks/useHistory";
import useWebSocket from "./hooks/useWebSocket";
import { drawArrow, drawRoundedRectangle, getBoundingBox } from "./util/util";

type SelectionRect = { x: number; y: number; width: number; height: number };
type TransformState = {
  moving: boolean;
  scaling: boolean;
  rotating: boolean;
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

const clampScale = (value: number) => Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);

const normalizeRect = (rect: SelectionRect): SelectionRect => ({
  x: rect.width < 0 ? rect.x + rect.width : rect.x,
  y: rect.height < 0 ? rect.y + rect.height : rect.y,
  width: Math.abs(rect.width),
  height: Math.abs(rect.height),
});

const hashIdToSeed = (id: string) => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) % 10_000;
};

const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x2 - x1, y2 - y1);

const toCanvasFontSize = (fontSize: string) => {
  const value = Number.parseFloat(fontSize);
  if (Number.isNaN(value)) return "16px";
  if (fontSize.endsWith("rem") || fontSize.endsWith("em")) return `${value * 16}px`;
  if (fontSize.endsWith("px")) return fontSize;
  return `${value}px`;
};

const getTextBounds = (text: TextItem) => {
  const fontPx = Number.parseFloat(toCanvasFontSize(text.options.fontSize));
  const safeFontPx = Number.isNaN(fontPx) ? 16 : fontPx;
  const estimatedWidth = Math.max(40, text.content.length * safeFontPx * 0.55);
  const estimatedHeight = Math.max(20, safeFontPx * 1.3);
  return {
    x: text.x,
    y: text.y,
    width: estimatedWidth,
    height: estimatedHeight,
  };
};

const Canvas = ({ boardId }: { boardId: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { elements = [], setElements, undo, redo } = useHistory([]);

  const [tool, setTool] = useState<ToolType>("rectangle");
  const [stroke, setStroke] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [fillStyle, setFillStyle] = useState<string>("none");
  const [opacity, setOpacity] = useState<number>(100);
  const [fontFamily, setFontFamily] = useState<string>("Caveat");
  const [fontSize, setFontSize] = useState<string>("1rem");
  const [textAlignment, setTextAlignment] = useState<string>("left");

  const [drawing, setDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Cursor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragTextOrigin, setDragTextOrigin] = useState<Point | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingElementText, setEditingElementText] = useState("");
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [isTransforming, setIsTransforming] = useState<TransformState>({
    moving: false,
    scaling: false,
    rotating: false,
  });
  const [transformOrigin, setTransformOrigin] = useState<Point>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { sendMessage, lastMessage } = useWebSocket(boardId);
  const applyingRemoteStateRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const hasReceivedInitialStateRef = useRef(false);
  const hasLocalChangesRef = useRef(false);
  const localClientIdRef = useRef<string>("");
  const lastCursorSentAtRef = useRef<number>(0);

  const toolsWithSidebar: ToolType[] = [
    "rectangle",
    "ellipse",
    "line",
    "arrow",
    "text",
    "pen",
  ];

  const selectedElements = useMemo(
    () => elements.filter((element) => selectedIds.includes(element.id)),
    [elements, selectedIds]
  );

  const editingElement = useMemo(
    () => elements.find((element) => element.id === editingElementId) ?? null,
    [editingElementId, elements]
  );

  const startEditingElementText = useCallback((element: Element) => {
    setSelectedIds([element.id]);
    setEditingElementId(element.id);
    setEditingElementText(element.text?.content ?? "");
  }, []);

  const stopEditingElementText = useCallback(() => {
    setEditingElementId(null);
    setEditingElementText("");
  }, []);

  const commitEditingElementText = useCallback(() => {
    if (!editingElementId) return;

    const nextText = editingElementText.trim();
    let updatedElement: Element | null = null;

    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== editingElementId) return element;
        updatedElement = {
          ...element,
          text: nextText
            ? {
                content: nextText,
                fontFamily,
                fontSize,
                color: stroke,
                textAlign: "center",
                opacity,
              }
            : undefined,
        };
        return updatedElement;
      })
    );

    if (updatedElement) {
      sendMessage(JSON.stringify(updatedElement));
    }

    stopEditingElementText();
  }, [
    editingElementId,
    editingElementText,
    fontFamily,
    fontSize,
    opacity,
    sendMessage,
    setElements,
    stopEditingElementText,
    stroke,
  ]);

  const toWorldPoint = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>): Point => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      const rawX = event.clientX - rect.left;
      const rawY = event.clientY - rect.top;
      return {
        x: (rawX - panOffset.x) / scale,
        y: (rawY - panOffset.y) / scale,
      };
    },
    [panOffset, scale]
  );

  const toWorldFromClient = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - panOffset.x) / scale,
        y: (clientY - rect.top - panOffset.y) / scale,
      };
    },
    [panOffset, scale]
  );

  const toScreenPoint = useCallback(
    (point: Point) => ({
      x: point.x * scale + panOffset.x,
      y: point.y * scale + panOffset.y,
    }),
    [panOffset, scale]
  );

  const zoomAtScreenPoint = useCallback((delta: number, screenX: number, screenY: number) => {
    setScale((prevScale) => {
      const nextScale = clampScale(prevScale * (1 + delta));
      if (nextScale === prevScale) return prevScale;

      setPanOffset((prevPan) => {
        const worldX = (screenX - prevPan.x) / prevScale;
        const worldY = (screenY - prevPan.y) / prevScale;
        return {
          x: screenX - worldX * nextScale,
          y: screenY - worldY * nextScale,
        };
      });

      return nextScale;
    });
  }, []);

  const onZoom = useCallback(
    (delta: number) => {
      zoomAtScreenPoint(delta, viewport.width / 2, viewport.height / 2);
    },
    [viewport.height, viewport.width, zoomAtScreenPoint]
  );

  const setScaleFromControls = useCallback(
    (nextScaleValue: number) => {
      const targetScale = clampScale(nextScaleValue);
      setScale((prevScale) => {
        if (prevScale === targetScale) return prevScale;

        setPanOffset((prevPan) => {
          const centerX = viewport.width / 2;
          const centerY = viewport.height / 2;
          const worldX = (centerX - prevPan.x) / prevScale;
          const worldY = (centerY - prevPan.y) / prevScale;
          return {
            x: centerX - worldX * targetScale,
            y: centerY - worldY * targetScale,
          };
        });

        return targetScale;
      });
    },
    [viewport.height, viewport.width]
  );

  const findElementAtPoint = useCallback(
    (x: number, y: number) => {
      for (let index = elements.length - 1; index >= 0; index -= 1) {
        const element = elements[index];
        const box = getBoundingBox(element);
        if (
          x >= box.x &&
          x <= box.x + box.width &&
          y >= box.y &&
          y <= box.y + box.height
        ) {
          return element;
        }
      }
      return null;
    },
    [elements]
  );

  const isElementInSelection = useCallback((element: Element, rect: SelectionRect) => {
    const normalized = normalizeRect(rect);
    const elementRect = getBoundingBox(element);
    return (
      elementRect.x < normalized.x + normalized.width &&
      elementRect.x + elementRect.width > normalized.x &&
      elementRect.y < normalized.y + normalized.height &&
      elementRect.y + elementRect.height > normalized.y
    );
  }, []);

  const clearCanvas = useCallback(
    (broadcast = true) => {
      hasLocalChangesRef.current = true;
      setElements([]);
      setTexts([]);
      setSelectedIds([]);
      setSelectedTextId(null);
      setEditingTextId(null);
      setDraggingTextId(null);
      setDragTextOrigin(null);
      setEditingElementId(null);
      setEditingElementText("");
      setCurrentElement(null);
      setDrawing(false);
      setSelectionRect(null);
      setIsTransforming({ moving: false, scaling: false, rotating: false });
      if (broadcast) sendMessage(JSON.stringify({ type: "clear" }));
    },
    [sendMessage, setElements]
  );

  const deleteSelectedElements = useCallback(
    (broadcast = true) => {
      if (!selectedIds.length && !selectedTextId) return;
      hasLocalChangesRef.current = true;
      const idsToDelete = new Set(selectedIds);
      setElements((prev) => prev.filter((element) => !idsToDelete.has(element.id)));
      setSelectedIds([]);
      setTexts((prev) => prev.filter((text) => text.id !== selectedTextId));
      setSelectedTextId(null);
      setEditingTextId(null);
      setDraggingTextId(null);
      setDragTextOrigin(null);
      setEditingElementId(null);
      setEditingElementText("");
      setSelectionRect(null);
      setIsTransforming({ moving: false, scaling: false, rotating: false });
      if (broadcast && idsToDelete.size > 0) {
        sendMessage(JSON.stringify({ type: "delete", ids: Array.from(idsToDelete) }));
      }
    },
    [selectedIds, selectedTextId, sendMessage, setElements]
  );

  const drawScene = useCallback(
    (
      context: CanvasRenderingContext2D,
      targetCanvas: HTMLCanvasElement,
      sceneElements: Element[],
      {
        includeSelection,
        includeSelectionRect,
        includeTexts,
      }: {
        includeSelection: boolean;
        includeSelectionRect: boolean;
        includeTexts: boolean;
      }
    ) => {
      context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      context.save();
      context.translate(panOffset.x, panOffset.y);
      context.scale(scale, scale);

      const roughCanvas = rough.canvas(targetCanvas);
      for (const element of sceneElements) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;

        context.save();
        context.globalAlpha = element.opacity / 100;
        context.translate(centerX, centerY);
        context.rotate(element.rotation);
        context.translate(-centerX, -centerY);

        const options: Options = {
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          fill: element.backgroundColor === "transparent" ? undefined : element.backgroundColor,
          fillStyle:
            element.fillStyle === "none"
              ? undefined
              : (element.fillStyle as Options["fillStyle"]),
          seed: element.seed,
        };

        if (element.strokeStyle === "dashed") context.setLineDash([5, 12]);
        else if (element.strokeStyle === "dotted") context.setLineDash([2, 8]);
        else context.setLineDash([]);

        switch (element.tool) {
          case "rectangle":
            drawRoundedRectangle(
              roughCanvas,
              element.x,
              element.y,
              element.width,
              element.height,
              10,
              options
            );
            break;
          case "ellipse":
            roughCanvas.ellipse(centerX, centerY, element.width, element.height, options);
            break;
          case "line":
            roughCanvas.line(element.x, element.y, element.endX, element.endY, options);
            break;
          case "arrow":
            drawArrow(roughCanvas, element.x, element.y, element.endX, element.endY, options);
            break;
          case "pen":
            (element.penPath ?? []).forEach((point, index, path) => {
              if (index === 0) return;
              const previous = path[index - 1];
              roughCanvas.line(previous.x, previous.y, point.x, point.y, options);
            });
            break;
          case "text":
            break;
        }

        if (element.text?.content) {
          context.save();
          context.globalAlpha = element.text.opacity / 100;
          context.fillStyle = element.text.color;
          context.font = `${toCanvasFontSize(element.text.fontSize)} ${element.text.fontFamily}`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(element.text.content, centerX, centerY);
          context.restore();
        }

        if (includeSelection && selectedIds.includes(element.id)) {
          context.strokeStyle = "red";
          context.lineWidth = 2;
          context.strokeRect(element.x, element.y, element.width, element.height);

          const rotX = element.x + element.width / 2;
          const rotY = element.y - 20;
          const scaleX = element.x + element.width;
          const scaleY = element.y + element.height;

          context.fillStyle = "blue";
          context.beginPath();
          context.arc(rotX, rotY, 5, 0, Math.PI * 2);
          context.arc(scaleX, scaleY, 5, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
      }

      if (includeSelectionRect && selectionRect) {
        const rect = normalizeRect(selectionRect);
        context.strokeStyle = "#2563eb";
        context.lineWidth = 1;
        context.setLineDash([6, 6]);
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.setLineDash([]);
      }

      context.restore();

      if (includeTexts) {
        texts.forEach((text) => {
          const screenX = text.x * scale + panOffset.x;
          const screenY = text.y * scale + panOffset.y;
          context.save();
          context.globalAlpha = text.options.opacity / 100;
          context.fillStyle = text.options.color;
          context.font = `${toCanvasFontSize(text.options.fontSize)} ${text.options.fontFamily}`;
          context.textAlign = text.options.textAlign as CanvasTextAlign;
          context.textBaseline = "top";
          context.fillText(text.content, screenX, screenY);
          context.restore();
        });
      }
    },
    [panOffset.x, panOffset.y, scale, selectedIds, selectionRect, texts]
  );

  const exportPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportContext = exportCanvas.getContext("2d");
    if (!exportContext) return;

    drawScene(exportContext, exportCanvas, elements, {
      includeSelection: false,
      includeSelectionRect: false,
      includeTexts: true,
    });

    const link = document.createElement("a");
    const time = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `redraw-${time}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }, [drawScene, elements]);

  const handleTransform = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedIds.length) return;

      const point = toWorldPoint(event);

      if (isTransforming.moving) {
        const dx = point.x - transformOrigin.x;
        const dy = point.y - transformOrigin.y;
        setElements((prev) =>
          prev.map((element) =>
            selectedIds.includes(element.id)
              ? { ...element, x: element.x + dx, y: element.y + dy }
              : element
          )
        );
        setTransformOrigin(point);
      }

      if (isTransforming.scaling && selectedElements[0]) {
        const base = selectedElements[0];
        setElements((prev) =>
          prev.map((element) =>
            element.id === base.id
              ? {
                  ...element,
                  width: point.x - element.x,
                  height: point.y - element.y,
                  endX: point.x,
                  endY: point.y,
                }
              : element
          )
        );
      }

      if (isTransforming.rotating && selectedElements[0]) {
        const base = selectedElements[0];
        const centerX = base.x + base.width / 2;
        const centerY = base.y + base.height / 2;
        const angle = Math.atan2(point.y - centerY, point.x - centerX);
        setElements((prev) =>
          prev.map((element) =>
            element.id === base.id ? { ...element, rotation: angle } : element
          )
        );
      }
    },
    [
      isTransforming.moving,
      isTransforming.rotating,
      isTransforming.scaling,
      selectedElements,
      selectedIds,
      setElements,
      toWorldPoint,
      transformOrigin,
    ]
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editingElementId) return;

    const point = toWorldPoint(event);

    if (tool === "text") return;

    if (tool === "select") {
      const clickedText = texts.find((text) => {
        const bounds = getTextBounds(text);
        return (
          point.x >= bounds.x &&
          point.x <= bounds.x + bounds.width &&
          point.y >= bounds.y &&
          point.y <= bounds.y + bounds.height
        );
      });

      if (clickedText) {
        setSelectedTextId(clickedText.id);
        setSelectedIds([]);
        setSelectionRect(null);
        return;
      }

      const clickedElement = findElementAtPoint(point.x, point.y);

      if (!clickedElement) {
        setSelectedIds([]);
        setSelectedTextId(null);
        setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
        return;
      }

      if (!selectedIds.includes(clickedElement.id)) {
        setSelectedIds([clickedElement.id]);
      }
      setSelectedTextId(null);

      const rotX = clickedElement.x + clickedElement.width / 2;
      const rotY = clickedElement.y - 20;
      const scaleX = clickedElement.x + clickedElement.width;
      const scaleY = clickedElement.y + clickedElement.height;

      if (getDistance(point.x, point.y, rotX, rotY) < 10) {
        setIsTransforming({ moving: false, scaling: false, rotating: true });
        return;
      }

      if (getDistance(point.x, point.y, scaleX, scaleY) < 10) {
        setIsTransforming({ moving: false, scaling: true, rotating: false });
        return;
      }

      setIsTransforming({ moving: true, scaling: false, rotating: false });
      setTransformOrigin(point);
      return;
    }

    const id = crypto.randomUUID();
    const draft: Element = {
      id,
      tool,
      x: point.x,
      y: point.y,
      endX: point.x,
      endY: point.y,
      width: 0,
      height: 0,
      stroke,
      strokeWidth,
      strokeStyle,
      backgroundColor,
      fillStyle,
      rotation: 0,
      opacity,
      seed: hashIdToSeed(id),
      penPath: tool === "pen" ? [point] : undefined,
    };

    setDrawing(true);
    setCurrentElement(draft);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toWorldPoint(event);
    const now = Date.now();
    if (now - lastCursorSentAtRef.current > 40) {
      lastCursorSentAtRef.current = now;
      sendMessage(
        JSON.stringify({
          type: "cursor",
          x: point.x,
          y: point.y,
        })
      );
    }

    if (draggingTextId && dragTextOrigin) {
      const dx = point.x - dragTextOrigin.x;
      const dy = point.y - dragTextOrigin.y;
      setTexts((prev) =>
        prev.map((text) =>
          text.id === draggingTextId
            ? { ...text, x: text.x + dx, y: text.y + dy }
            : text
        )
      );
      setDragTextOrigin(point);
      return;
    }

    if (
      isTransforming.moving ||
      isTransforming.scaling ||
      isTransforming.rotating
    ) {
      handleTransform(event);
      return;
    }

    if (tool === "select" && selectionRect) {
      setSelectionRect((prev) =>
        prev
          ? { ...prev, width: point.x - prev.x, height: point.y - prev.y }
          : prev
      );
      return;
    }

    if (!drawing || !currentElement) return;

    if (tool === "pen") {
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              endX: point.x,
              endY: point.y,
              penPath: [...(prev.penPath ?? []), point],
            }
          : prev
      );
      return;
    }

    setCurrentElement((prev) =>
      prev
        ? {
            ...prev,
            endX: point.x,
            endY: point.y,
            width: point.x - prev.x,
            height: point.y - prev.y,
          }
        : prev
    );
  };

  const finalizeInteraction = useCallback((releasePoint?: Point) => {
    const hasActiveInteraction =
      draggingTextId ||
      selectionRect ||
      currentElement ||
      drawing ||
      isTransforming.moving ||
      isTransforming.scaling ||
      isTransforming.rotating;

    if (!hasActiveInteraction) return;

    if (draggingTextId) {
      setDraggingTextId(null);
      setDragTextOrigin(null);
      return;
    }

    if (selectionRect) {
      const finalSelectionRect =
        releasePoint && tool === "select"
          ? {
              ...selectionRect,
              width: releasePoint.x - selectionRect.x,
              height: releasePoint.y - selectionRect.y,
            }
          : selectionRect;
      const selected = elements.filter((element) =>
        isElementInSelection(element, finalSelectionRect)
      );
      setSelectedIds(selected.map((element) => element.id));
      setSelectedTextId(null);
      setSelectionRect(null);
    } else if (currentElement) {
      let finalizedElement = currentElement;

      if (releasePoint) {
        const point = releasePoint;
        if (currentElement.tool === "pen") {
          const currentPath = currentElement.penPath ?? [];
          const lastPoint = currentPath[currentPath.length - 1];
          const hasMoved =
            !lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y;
          finalizedElement = {
            ...currentElement,
            endX: point.x,
            endY: point.y,
            penPath: hasMoved ? [...currentPath, point] : currentPath,
          };
        } else {
          finalizedElement = {
            ...currentElement,
            endX: point.x,
            endY: point.y,
            width: point.x - currentElement.x,
            height: point.y - currentElement.y,
          };
        }
      }

      const shouldAddElement =
        finalizedElement.tool === "pen"
          ? (finalizedElement.penPath?.length ?? 0) > 1
          : Math.hypot(finalizedElement.width, finalizedElement.height) > 6;

      if (shouldAddElement) {
        hasLocalChangesRef.current = true;
        setElements((prev) => [...prev, finalizedElement]);
        sendMessage(JSON.stringify(finalizedElement));
      }
    }

    setCurrentElement(null);
    setDrawing(false);
    setIsTransforming({ moving: false, scaling: false, rotating: false });
  }, [
    currentElement,
    draggingTextId,
    drawing,
    elements,
    isElementInSelection,
    isTransforming.moving,
    isTransforming.rotating,
    isTransforming.scaling,
    selectionRect,
    sendMessage,
    setElements,
    tool,
  ]);

  const handleMouseUp = (event?: React.MouseEvent<HTMLCanvasElement>) => {
    const releasePoint = event ? toWorldPoint(event) : undefined;
    finalizeInteraction(releasePoint);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "text") return;

    const point = toWorldPoint(event);
    const textId = crypto.randomUUID();
    const text: TextItem = {
      id: textId,
      x: point.x,
      y: point.y,
      content: "",
      options: {
        fontFamily,
        fontSize,
        color: stroke,
        textAlign: textAlignment,
        opacity,
      },
    };

    hasLocalChangesRef.current = true;
    setTexts((prev) => [...prev, text]);
  };

  const handleCanvasDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "select") return;
    const point = toWorldPoint(event);
    const target = findElementAtPoint(point.x, point.y);
    if (!target) return;
    startEditingElementText(target);
  };

  const handleTextEdit = (id: string, newContent: string) => {
    hasLocalChangesRef.current = true;
    setTexts((prev) =>
      prev.map((text) =>
        text.id === id ? { ...text, content: newContent } : text
      )
    );
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const itemsToDraw = currentElement ? [...elements, currentElement] : elements;
    drawScene(context, canvas, itemsToDraw, {
      includeSelection: true,
      includeSelectionRect: true,
      includeTexts: false,
    });
  }, [currentElement, drawScene, elements]);

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      zoomAtScreenPoint(-event.deltaY * 0.0015, event.clientX, event.clientY);
      return;
    }

    setPanOffset((prev) => ({
      x: prev.x - event.deltaX,
      y: prev.y - event.deltaY,
    }));
  };

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    if (!boardId) return;

    if (applyingRemoteStateRef.current) {
      applyingRemoteStateRef.current = false;
      return;
    }

    if (!hasReceivedInitialStateRef.current && !hasLocalChangesRef.current) {
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      sendMessage(
        JSON.stringify({
          type: "state_sync",
          boardId,
          state: { elements, texts },
        })
      );
    }, 120);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [boardId, elements, sendMessage, texts]);

  useEffect(() => {
    const keyboardFunction = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.ctrlKey || event.metaKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
          return;
        }

        if (key === "y") {
          event.preventDefault();
          redo();
          return;
        }
      }

      if (key === "delete" || key === "backspace") {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          return;
        }
        event.preventDefault();
        deleteSelectedElements();
        return;
      }

      if (key === "escape") {
        if (editingElementId) {
          stopEditingElementText();
          return;
        }
        if (editingTextId) {
          setEditingTextId(null);
          return;
        }
        if (draggingTextId) {
          setDraggingTextId(null);
          setDragTextOrigin(null);
          return;
        }
        setSelectedIds([]);
        setSelectedTextId(null);
        setSelectionRect(null);
        setCurrentElement(null);
        setDrawing(false);
      }
    };

    document.addEventListener("keydown", keyboardFunction);
    return () => {
      document.removeEventListener("keydown", keyboardFunction);
    };
  }, [
    deleteSelectedElements,
    draggingTextId,
    editingElementId,
    editingTextId,
    redo,
    stopEditingElementText,
    undo,
  ]);

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onWindowMouseUp = (event: MouseEvent) => {
      finalizeInteraction(toWorldFromClient(event.clientX, event.clientY));
    };
    const onWindowBlur = () => {
      finalizeInteraction();
    };

    window.addEventListener("mouseup", onWindowMouseUp);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("mouseup", onWindowMouseUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [finalizeInteraction, toWorldFromClient]);

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== "object") return;

    const payload = lastMessage as {
      type?: string;
      state?: {
        elements?: Element[];
        texts?: TextItem[];
      };
      boardId?: string;
      ids?: string[];
      id?: string;
      tool?: string;
      x?: number;
      y?: number;
      clientId?: string;
    };

    if (
      (payload.type === "init" || payload.type === "state_sync") &&
      payload.state
    ) {
      if (payload.type === "init" && hasLocalChangesRef.current) {
        hasReceivedInitialStateRef.current = true;
        if (payload.clientId) {
          localClientIdRef.current = payload.clientId;
        }
        return;
      }

      hasReceivedInitialStateRef.current = true;
      if (payload.clientId) {
        localClientIdRef.current = payload.clientId;
      }
      applyingRemoteStateRef.current = true;
      hasLocalChangesRef.current = false;
      setElements(payload.state.elements ?? []);
      setTexts(payload.state.texts ?? []);
      return;
    }

    if (
      payload.type === "cursor" &&
      typeof payload.x === "number" &&
      typeof payload.y === "number" &&
      payload.clientId &&
      payload.clientId !== localClientIdRef.current
    ) {
      const clientId = payload.clientId;
      const x = payload.x;
      const y = payload.y;
      setRemoteCursors((prev) => {
        const existing = prev.find((cursor) => cursor.id === clientId);
        if (existing) {
          return prev.map((cursor) =>
            cursor.id === clientId
              ? { ...cursor, x, y }
              : cursor
          );
        }
        return [
          ...prev,
          {
            id: clientId,
            x,
            y,
            label: "Anonymous",
          },
        ];
      });
      return;
    }

    if (payload.type === "cursor_leave" && payload.clientId) {
      setRemoteCursors((prev) =>
        prev.filter((cursor) => cursor.id !== payload.clientId)
      );
      return;
    }

    if (payload.type === "clear") {
      clearCanvas(false);
      return;
    }

    if (payload.type === "delete" && payload.ids?.length) {
      const idSet = new Set(payload.ids);
      setElements((prev) => prev.filter((element) => !idSet.has(element.id)));
      setSelectedIds((prev) => prev.filter((id) => !idSet.has(id)));
      if (editingElementId && idSet.has(editingElementId)) {
        stopEditingElementText();
      }
      return;
    }

    if (!payload.id || !payload.tool) return;

    setElements((prev) => {
      const exists = prev.some((element) => element.id === payload.id);
      if (exists) {
        return prev.map((element) =>
          element.id === payload.id ? ({ ...element, ...payload } as Element) : element
        );
      }
      return [...prev, payload as Element];
    });
  }, [clearCanvas, editingElementId, lastMessage, setElements, stopEditingElementText]);

  const canvasCursor = useMemo(() => {
    if (tool === "text") return "text";
    if (tool === "select" && isTransforming.moving) return "grabbing";
    if (tool === "select") return "default";
    return "crosshair";
  }, [isTransforming.moving, tool]);

  useEffect(() => {
    setRemoteCursors([]);
  }, [boardId]);

  const editingScreenPoint = useMemo(() => {
    if (!editingElement) return null;
    return toScreenPoint({
      x: editingElement.x + editingElement.width / 2,
      y: editingElement.y + editingElement.height / 2,
    });
  }, [editingElement, toScreenPoint]);

  return (
    <div>
      <div className="fixed top-0 left-0 z-20 w-full flex justify-center p-4">
        <Toolbar
          activeTool={tool}
          setTool={setTool}
          clearCanvas={() => clearCanvas()}
          deleteSelected={() => deleteSelectedElements()}
          exportPng={exportPng}
          hasSelection={selectedIds.length > 0 || selectedTextId !== null}
        />
      </div>

      <div className="flex fixed z-20 gap-10 bottom-2 left-2 p-2">
        <ControlPanel
          undo={undo}
          redo={redo}
          onZoom={onZoom}
          scale={scale}
          setScale={setScaleFromControls}
        />
      </div>

      {toolsWithSidebar.includes(tool) && (
        <div className="fixed top-1/2 left-0 z-20 -translate-y-1/2 p-4">
          <Stylebar
            stroke={stroke}
            setStroke={setStroke}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeStyle={strokeStyle}
            setStrokeStyle={(value) => setStrokeStyle(value as StrokeStyle)}
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

      <div className="fixed right-3 top-24 z-20 rounded-md border border-border bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
        <div>`Delete` removes selected shape</div>
        <div>`Esc` clears selection</div>
        <div>`Double-click` shape to edit text</div>
        <div>`Cmd/Ctrl + Wheel` zooms</div>
      </div>

      {remoteCursors.map((cursor) => {
        const screen = toScreenPoint({ x: cursor.x, y: cursor.y });
        return (
          <div
            key={cursor.id}
            className="pointer-events-none fixed z-40"
            style={{
              left: screen.x,
              top: screen.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
            <div className="mt-1 rounded bg-blue-500 px-2 py-0.5 text-[10px] text-white">
              {cursor.label ?? "Anonymous"}
            </div>
          </div>
        );
      })}

      <div className="flex-grow overflow-auto">
        {editingElement && editingScreenPoint && (
          <input
            type="text"
            value={editingElementText}
            onChange={(event) => setEditingElementText(event.target.value)}
            onBlur={commitEditingElementText}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitEditingElementText();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                stopEditingElementText();
              }
            }}
            style={{
              position: "absolute",
              left: editingScreenPoint.x,
              top: editingScreenPoint.y,
              transform: "translate(-50%, -50%)",
              width: "220px",
              textAlign: "center",
              background: "transparent",
              border: "none",
              outline: "none",
              boxShadow: "none",
              color: stroke,
              fontSize,
              fontFamily,
              padding: "2px 4px",
            }}
            autoFocus
          />
        )}
        {texts.map((text) => {
          const screen = toScreenPoint({ x: text.x, y: text.y });
          const isEditingText = editingTextId === text.id;
          return (
            <div
              key={text.id}
              onMouseDown={(event) => {
                if (tool !== "select") return;
                event.stopPropagation();
                setSelectedTextId(text.id);
                setSelectedIds([]);
                if (editingTextId !== text.id) {
                  const origin = toWorldFromClient(event.clientX, event.clientY);
                  setDraggingTextId(text.id);
                  setDragTextOrigin(origin);
                }
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                setSelectedTextId(text.id);
                setSelectedIds([]);
                setEditingTextId(text.id);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                position: "absolute",
                left: screen.x,
                top: screen.y,
                cursor: tool === "select" ? "default" : "text",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                zIndex: 30,
              }}
            >
              <input
                type="text"
                value={text.content}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: text.options.color,
                  fontSize: text.options.fontSize,
                  fontFamily: text.options.fontFamily,
                  textAlign: text.options.textAlign as "left" | "center" | "right",
                  opacity: text.options.opacity / 100,
                  pointerEvents:
                    tool === "text" || isEditingText ? "auto" : "none",
                  boxShadow: "none",
                }}
                onChange={(event) => handleTextEdit(text.id, event.target.value)}
                onFocus={() => {
                  setSelectedTextId(text.id);
                }}
                onBlur={() => {
                  if (editingTextId === text.id) {
                    setEditingTextId(null);
                  }
                }}
                readOnly={tool !== "text" && !isEditingText}
                autoFocus={isEditingText}
              />
            </div>
          );
        })}

        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          className="touch-none"
          style={{ cursor: canvasCursor, zIndex: 0, position: "relative" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={(event) => handleMouseUp(event)}
          onMouseLeave={() => handleMouseUp()}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
        />
      </div>
    </div>
  );
};

export default Canvas;
