import { createRoot } from "react-dom/client";
import "./index.css";

// Import components and utilities
import { App } from "./App";

// Mount the application
createRoot(document.getElementById("root")!).render(<App />);
