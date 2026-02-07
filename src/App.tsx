import { useEffect, useMemo, useState } from "react";
import Canvas from "./components/canvas";
import { ThemeProvider } from "./components/theme-provider";

type BoardMeta = {
  id: string;
  title: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const fetchBoards = async () => {
  const response = await fetch(`${API_URL}/boards`);
  if (!response.ok) {
    throw new Error("Failed to fetch boards");
  }
  return (await response.json()) as { boards: BoardMeta[] };
};

const createBoard = async () => {
  const response = await fetch(`${API_URL}/boards`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Failed to create board");
  }
  return (await response.json()) as { board: BoardMeta };
};

const getBoardIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("board") ?? "";
};

const updateUrlBoard = (boardId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("board", boardId);
  window.history.replaceState({}, "", url.toString());
};

const App = () => {
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [boardId, setBoardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const activeBoardId = useMemo(() => boardId, [boardId]);
  const hasActiveBoardInList = useMemo(
    () => boards.some((board) => board.id === activeBoardId),
    [activeBoardId, boards]
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const initialBoardFromUrl = getBoardIdFromUrl();
        const { boards: boardList } = await fetchBoards();
        setBoards(boardList);

        if (initialBoardFromUrl) {
          setBoardId(initialBoardFromUrl);
          return;
        }

        if (boardList.length > 0) {
          setBoardId(boardList[0].id);
          updateUrlBoard(boardList[0].id);
          return;
        }

        const created = await createBoard();
        setBoards([created.board]);
        setBoardId(created.board.id);
        updateUrlBoard(created.board.id);
      } catch (initError) {
        setError(initError instanceof Error ? initError.message : "Initialization failed");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleCreateBoard = async () => {
    try {
      const created = await createBoard();
      setBoards((prev) => [created.board, ...prev]);
      setBoardId(created.board.id);
      updateUrlBoard(created.board.id);
      setError("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create board");
    }
  };

  const handleBoardChange = (nextBoardId: string) => {
    setBoardId(nextBoardId);
    updateUrlBoard(nextBoardId);
  };

  const handleShare = async () => {
    const shareLink = new URL(window.location.href);
    shareLink.searchParams.set("board", activeBoardId);

    try {
      await navigator.clipboard.writeText(shareLink.toString());
    } catch {
      window.prompt("Copy board link", shareLink.toString());
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed left-3 top-3 z-30 flex items-center gap-2 rounded-md border border-border bg-background/90 px-3 py-2 shadow-sm backdrop-blur-sm">
        <select
          className="rounded-md border border-border bg-card px-2 py-1 text-sm"
          value={activeBoardId}
          onChange={(event) => handleBoardChange(event.target.value)}
          disabled={loading || (!boards.length && !activeBoardId)}
          aria-label="Select board"
        >
          {activeBoardId && !hasActiveBoardInList && (
            <option value={activeBoardId}>{`Board ${activeBoardId.slice(0, 8)}`}</option>
          )}
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.title}
            </option>
          ))}
        </select>
        <button
          className="rounded-md border border-border bg-card px-2 py-1 text-sm hover:bg-accent"
          onClick={handleCreateBoard}
          type="button"
        >
          New Board
        </button>
        <button
          className="rounded-md border border-border bg-card px-2 py-1 text-sm hover:bg-accent"
          onClick={handleShare}
          type="button"
          disabled={!activeBoardId}
        >
          Share
        </button>
      </div>

      {error && (
        <div className="fixed top-14 left-3 z-30 rounded-md border border-destructive bg-background px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {activeBoardId && <Canvas key={activeBoardId} boardId={activeBoardId} />}
    </ThemeProvider>
  );
};

export default App;
