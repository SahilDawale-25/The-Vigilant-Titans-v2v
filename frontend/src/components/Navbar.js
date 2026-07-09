"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cycle-tracker", label: "Cycle Tracker" },
  { href: "/mental-wellness", label: "Mental Wellness" },
  { href: "/pregnancy", label: "Pregnancy" },
  { href: "/new-mother", label: "New Mother" },
  { href: "/menopause", label: "Menopause" },
  { href: "/teen-wellness", label: "Teen Wellness" },
  { href: "/monthly-report", label: "Monthly Report" },
  { href: "/health-twin", label: "Health Twin" },
  { href: "/report-analyzer", label: "Report Analyzer" },
  { href: "/voice-assistant", label: "Voice Assistant" },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

 
  if (!user || pathname === "/login" || pathname === "/signup") return null;

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-purple-700">
          HerWellness
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href
                  ? "text-purple-700 border-b-2 border-purple-700 pb-1"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-purple-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${
                pathname === link.href ? "text-purple-700" : "text-gray-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg w-full text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}