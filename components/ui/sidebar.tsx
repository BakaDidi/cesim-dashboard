import React from "react"
import Link from "next/link"

export function Sidebar() {
    return (
        // Cache la sidebar sur mobile, l'affiche sur les écrans lg et plus
        <aside className="hidden w-64 border-r bg-gray-50 dark:bg-slate-800 dark:border-slate-700 lg:block">
            <nav className="sticky top-16 h-[calc(100vh-4rem)] overflow-auto p-4">
                <ul className="space-y-2">
                    <li>
                        <Link href="/" className="hover:underline">
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link href="/page1" className="hover:underline">
                            Page 1
                        </Link>
                    </li>
                    <li>
                        <Link href="/page2" className="hover:underline">
                            Page 2
                        </Link>
                    </li>
                    {/* Ajoutez d'autres liens ou sections si nécessaire */}
                </ul>
            </nav>
        </aside>
    )
}