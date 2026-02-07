import { useCallback, useMemo, useState } from "react";
import { Element } from "@/types";

interface SelectionState {
  selectedIds: Set<string>;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
}

export function useSelection(elements: Element[]) {
  const [state, setState] = useState<SelectionState>({
    selectedIds: new Set(),
    selectionBox: null,
  });

  // Memoized bounding box calculations
  const elementBounds = useMemo(() => {
    return elements.map((el) => ({
      ...el,
      right: el.x + el.width,
      bottom: el.y + el.height,
    }));
  }, [elements]);

  // Select single element (click selection)
  const selectElement = useCallback(
    (x: number, y: number) => {
      for (let i = elementBounds.length - 1; i >= 0; i--) {
        const { id, x: elX, y: elY, right, bottom } = elementBounds[i];
        if (x >= elX && x <= right && y >= elY && y <= bottom) {
          setState({ selectedIds: new Set([id]), selectionBox: null });
          return;
        }
      }
      setState({ selectedIds: new Set(), selectionBox: null });
    },
    [elementBounds]
  );

  // Start drag selection
  const startSelection = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      selectionBox: { x, y, width: 0, height: 0 },
    }));
  }, []);

  // Update drag selection box
  const updateSelection = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (!prev.selectionBox) return prev;
      return {
        ...prev,
        selectionBox: {
          x: Math.min(prev.selectionBox.x, x),
          y: Math.min(prev.selectionBox.y, y),
          width: Math.abs(x - prev.selectionBox.x),
          height: Math.abs(y - prev.selectionBox.y),
        },
      };
    });
  }, []);

  // Finalize selection based on selection box
  const finalizeSelection = useCallback(() => {
    setState((prev) => {
      if (!prev.selectionBox) return prev;
      const { x, y, width, height } = prev.selectionBox;
      const selected = new Set(
        elementBounds
          .filter(
            ({ x: elX, y: elY, right, bottom }) =>
              right >= x && elX <= x + width && bottom >= y && elY <= y + height
          )
          .map(({ id }) => id)
      );
      return { selectedIds: selected, selectionBox: null };
    });
  }, [elementBounds]);

  return {
    selectedElementIds: Array.from(state.selectedIds),
    selectionBox: state.selectionBox,
    selectElement,
    startSelection,
    updateSelection,
    finalizeSelection,
  };
}
