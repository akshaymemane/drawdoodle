import { Github, Minus, Plus, Redo, Undo } from "lucide-react";

type ControlPanelProps = {
  undo: () => void;
  redo: () => void;
  onZoom: (scale: number) => void;
  scale: number;
  setScale: (scale: number) => void;
};

export function ControlPanel({
  undo,
  redo,
  onZoom,
  scale,
  setScale,
}: ControlPanelProps) {
  return (
    <>
      <div className="flex gap-10 items-center">
        <div className="flex gap-2">
          <div>
            <button onClick={() => onZoom(-0.1)} aria-label="Zoom Out">
              <Minus />
            </button>
          </div>
          <div content={`Set scale to 100%`}>
            <button
              onClick={() => setScale(1)}
              aria-label={`Set scale to 100%`}
            >
              {new Intl.NumberFormat("en-GB", { style: "percent" }).format(
                scale
              )}
            </button>
          </div>
          <div content="Zoom In">
            <button onClick={() => onZoom(0.1)} aria-label="Zoom In">
              <Plus />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div content="Undo last action">
            <button onClick={undo} aria-label="Undo last action">
              <Undo />
            </button>
          </div>
          <div content="Redo last action">
            <button onClick={redo} aria-label="Redo last action">
              <Redo />
            </button>
          </div>
        </div>
      </div>{" "}
      <a
        className="flex fixed bottom-10 right-10 "
        href="https://github.com/akshaymemane"
        target="_blank"
      >
        <Github />
        Created by Akshay
      </a>
    </>
  );
}
