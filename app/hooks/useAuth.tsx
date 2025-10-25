"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  isVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  allowUnauthenticatedPaths?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, allowUnauthenticatedPaths = [] }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/check-auth", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null); // just set null, DO NOT redirect here
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Only redirect after loading finishes
  useEffect(() => {
    if (!loading && !user) {
      const pathname = window.location.pathname;
      const isAllowed = allowUnauthenticatedPaths.some((path) => {
        const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
        return pathname === normalizedPath || pathname.startsWith(`${normalizedPath}/`);
      });
      if (!isAllowed) {
        router.push("/login");
      }
    }
  }, [loading, user, router, allowUnauthenticatedPaths]);

  return <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
