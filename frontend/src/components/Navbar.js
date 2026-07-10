"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

// Standalone links + grouped categories
const PRIMARY_LINKS = [{ href: "/dashboard", label: "Dashboard" }];

const CATEGORIES = [
  {
    label: "Life Stages",
    items: [
      { href: "/cycle-tracker", label: "Cycle Tracker" },
      { href: "/pregnancy", label: "Pregnancy" },
      { href: "/new-mother", label: "New Mother" },
      { href: "/menopause", label: "Menopause" },
      { href: "/teen-wellness", label: "Teen Wellness" },
    ],
  },
  {
    label: "Wellness Tools",
    items: [
      { href: "/mental-wellness", label: "Mental Wellness" },
      { href: "/health-twin", label: "Health Twin" },
      { href: "/report-analyzer", label: "Report Analyzer" },
      { href: "/voice-assistant", label: "Voice Assistant" },
    ],
  },
];

const TRAILING_LINKS = [{ href: "/monthly-report", label: "Monthly Report" }];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="15" cy="15" r="14" stroke="#ed3a73" strokeWidth="1.6" />
        <path
          d="M15 8c-3.5 3.2-6 5.8-6 8.6a6 6 0 0 0 12 0c0-2.8-2.5-5.4-6-8.6Z"
          fill="#e82121"
        />
        <circle cx="12.6" cy="15.2" r="1.3" fill="white" opacity="0.85" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-gray-900">
        Her<span className="text-pink-600">Wellness</span>
      </span>
    </Link>
  );
}

function DesktopDropdown({ category, pathname }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const isActive = category.items.some((i) => i.href === pathname);

  function openNow() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        className={`flex items-center gap-1 text-sm font-medium py-2 transition-colors ${
          isActive ? "text-violet-700" : "text-gray-500 hover:text-violet-700"
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {category.label}
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isActive && (
        <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-violet-700 rounded-full" />
      )}

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-52 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
            {category.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  pathname === item.href
                    ? "text-violet-700 bg-violet-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-violet-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label, pathname }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium py-2 transition-colors ${
        isActive ? "text-violet-700" : "text-gray-500 hover:text-violet-700"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-violet-700 rounded-full" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCategoryOpen(null);
  }, [pathname]);

  if (!user || pathname === "/login" || pathname === "/signup") return null;

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {PRIMARY_LINKS.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
            {CATEGORIES.map((cat) => (
              <DesktopDropdown key={cat.label} category={cat} pathname={pathname} />
            ))}
            {TRAILING_LINKS.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}

            <button
              onClick={handleLogout}
              className="text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-700 p-1.5 -mr-1.5"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {menuOpen ? (
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href ? "text-violet-700 bg-violet-50" : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {CATEGORIES.map((cat) => {
            const expanded = mobileCategoryOpen === cat.label;
            const isActive = cat.items.some((i) => i.href === pathname);
            return (
              <div key={cat.label}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? "text-violet-700 bg-violet-50" : "text-gray-600"
                  }`}
                  onClick={() =>
                    setMobileCategoryOpen(expanded ? null : cat.label)
                  }
                >
                  {cat.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {expanded && (
                  <div className="pl-4 space-y-1 mt-1 mb-1">
                    {cat.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm ${
                          pathname === item.href
                            ? "text-violet-700 bg-violet-50 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {TRAILING_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href ? "text-violet-700 bg-violet-50" : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full text-sm font-medium bg-violet-600 text-white px-4 py-2.5 rounded-lg mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}