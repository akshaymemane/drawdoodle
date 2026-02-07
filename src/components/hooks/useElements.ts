import { useCallback, useState } from "react";
import { Element } from "@/types";

export function useElements() {
  const [elements, setElements] = useState<Map<string, Element>>(new Map());

  // Add a new element
  const addElement = useCallback((newElement: Element) => {
    setElements((prev) => new Map(prev).set(newElement.id, newElement));
  }, []);

  // Update an existing element
  const updateElement = useCallback((id: string, updates: Partial<Element>) => {
    setElements((prev) => {
      if (!prev.has(id)) return prev;
      const updatedElements = new Map(prev);
      updatedElements.set(id, { ...prev.get(id)!, ...updates });
      return updatedElements;
    });
  }, []);

  // Delete an element
  const deleteElement = useCallback((id: string) => {
    setElements((prev) => {
      if (!prev.has(id)) return prev;
      const updatedElements = new Map(prev);
      updatedElements.delete(id);
      return updatedElements;
    });
  }, []);

  // Get elements as an array (for rendering)
  const elementsArray = Array.from(elements.values());

  return {
    elementsArray,
    addElement,
    updateElement,
    deleteElement,
  };
}
