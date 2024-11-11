import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";

export default function App() {

  useEffect(() => {
    syncThemeWithLocal();
  }, []);

  return <RouterProvider router={router} />;
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
