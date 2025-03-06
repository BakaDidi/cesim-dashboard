import React from "react"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

export function SiteHeader() {
  return (
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Logo ou nom du site */}
          <Link href="/" className="text-lg font-bold">
            MonSite
          </Link>

          {/* Espace flexible pour pousser le reste à droite */}
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </header>
  )
}