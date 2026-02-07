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
      <div className="flex gap-6 items-center rounded-lg border border-border bg-background/85 backdrop-blur-sm px-3 py-2 shadow-sm">
        <div className="flex gap-2">
          <div>
            <button
              className="rounded-md border border-border bg-card px-2 py-1 text-foreground hover:bg-accent"
              onClick={() => onZoom(-0.1)}
              aria-label="Zoom Out"
            >
              <Minus />
            </button>
          </div>
          <div>
            <button
              className="rounded-md border border-border bg-card px-2 py-1 text-foreground hover:bg-accent"
              onClick={() => setScale(1)}
              aria-label={`Set scale to 100%`}
            >
              {new Intl.NumberFormat("en-GB", { style: "percent" }).format(
                scale
              )}
            </button>
          </div>
          <div>
            <button
              className="rounded-md border border-border bg-card px-2 py-1 text-foreground hover:bg-accent"
              onClick={() => onZoom(0.1)}
              aria-label="Zoom In"
            >
              <Plus />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div>
            <button
              className="rounded-md border border-border bg-card px-2 py-1 text-foreground hover:bg-accent"
              onClick={undo}
              aria-label="Undo last action"
            >
              <Undo />
            </button>
          </div>
          <div>
            <button
              className="rounded-md border border-border bg-card px-2 py-1 text-foreground hover:bg-accent"
              onClick={redo}
              aria-label="Redo last action"
            >
              <Redo />
            </button>
          </div>
        </div>
      </div>
      <a
        className="flex fixed bottom-10 right-10 rounded-md border border-border bg-background/85 px-2 py-1 text-foreground backdrop-blur-sm"
        href="https://github.com/akshaymemane"
        target="_blank"
        rel="noreferrer"
      >
        <Github />
        Created by Akshay
      </a>
    </>
  );
}
