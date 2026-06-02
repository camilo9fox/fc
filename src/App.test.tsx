/// <reference types="jest" />
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Flashy app without crashing", () => {
  render(<App />);
  const skipLink = screen.getByText(/Saltar al contenido principal/i);
  expect(skipLink).toBeInTheDocument();
});
