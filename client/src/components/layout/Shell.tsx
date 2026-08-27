import { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import StickyRailAd from "../ads/StickyRailAd";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyRailAd />
    </div>
  );
}
