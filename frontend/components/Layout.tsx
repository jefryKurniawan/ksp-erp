/** @jsxImportSource preact */
import { ComponentChildren } from "preact";
import LayoutWrapper from "../islands/LayoutWrapper.tsx";

interface LayoutProps {
  children: ComponentChildren;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <LayoutWrapper showFooter={showFooter}>
      {children}
    </LayoutWrapper>
  );
}