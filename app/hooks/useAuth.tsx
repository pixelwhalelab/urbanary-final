"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

export const AuthProvider = ({
  children,
  allowUnauthenticatedPaths = [],
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/check-auth", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        if (res.status === 401) {
          setUser(null);
        } else {
          console.error("Unexpected status:", res.status);
          setUser(null);
        }
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

  useEffect(() => {
    if (loading) return;

    const pathname = window.location.pathname;

    const publicPaths = ["/", "/search"];
    const isPublic = publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isPublic) return;

    const isUnauthPath = allowUnauthenticatedPaths.some((path) => {
      const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
      return (
        pathname === normalizedPath || pathname.startsWith(`${normalizedPath}/`)
      );
    });

    if (!user && !isUnauthPath) {
      router.push("/login");
    } else if (user && isUnauthPath) {
      router.push("/search");
    }
  }, [loading, user, router, allowUnauthenticatedPaths]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
