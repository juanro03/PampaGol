"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function SiteNavigation({ categorias, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header
        onOpenMenu={() => setMobileMenuOpen(true)}
      />

      <div className="pp-layout">
        <Sidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          categorias={categorias}
        />
        {children}
      </div>
    </>
  );
}