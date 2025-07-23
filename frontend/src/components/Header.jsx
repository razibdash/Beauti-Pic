"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
      <Link
        href="/"
        className="text-2xl font-bold text-blue-600 dark:text-blue-400"
      >
        AI ImageGen
      </Link>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user ? (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              👤 {user.username}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setUser(null);
                router.push("/login");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-1 rounded text-sm transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
