import Canvas from "./components/canvas";
import { ThemeProvider } from "./components/theme-provider";

const App = () => {
  

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Canvas />
    </ThemeProvider>
  );
};

export default App;
