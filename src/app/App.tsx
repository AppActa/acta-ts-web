import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { LayoutProporcional } from "../features/layout/components/LayoutProporcional";

export function App() {
  return (
    <LayoutProporcional>
      <RouterProvider router={router} />
    </LayoutProporcional>
  );
}
