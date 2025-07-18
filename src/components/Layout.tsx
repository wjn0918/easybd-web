import type {ReactNode} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "sonner"

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <Toaster />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
