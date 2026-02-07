import { Element } from "@/types";
import { useState } from "react";

export const useHistory = (initialState: Element[]) => {
  const [state, setState] = useState({
    index: 0,
    history: [initialState],
  });

  const setElements = (
    action: Element[] | ((current: Element[]) => Element[]),
    overwrite = false
  ) => {
    setState((prev) => {
      const current = prev.history[prev.index];
      const next = typeof action === "function" ? action(current) : action;

      if (overwrite) {
        const historyCopy = [...prev.history];
        historyCopy[prev.index] = next;
        return {
          ...prev,
          history: historyCopy,
        };
      }

      const trimmedHistory = prev.history.slice(0, prev.index + 1);
      const nextHistory = [...trimmedHistory, next];
      return {
        index: nextHistory.length - 1,
        history: nextHistory,
      };
    });
  };

  const undo = () =>
    setState((prev) =>
      prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev
    );
  const redo = () =>
    setState((prev) =>
      prev.index < prev.history.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev
    );

  return {
    elements: state.history[state.index],
    setElements,
    undo,
    redo,
  };
};
