"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, BookOpen, Phone } from "lucide-react";

const navItems = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/booking", label: "Bron", icon: CalendarCheck },
  { href: "/rules", label: "Qoidalar", icon: BookOpen },
  { href: "/contact", label: "Aloqa", icon: Phone },
];

export default function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200/50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              <div
                className={`
                  p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? "bg-green-100" : ""}
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-green-700" : ""
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
