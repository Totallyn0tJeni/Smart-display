import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("App initializing...");
createRoot(document.getElementById("root")!).render(<App />);
