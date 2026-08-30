import { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
