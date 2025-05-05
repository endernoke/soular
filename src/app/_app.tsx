import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
