"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "rpl_token";

type Token = { tokenType: string; accessToken: string };
type Profile = { id: number; name?: string; surname?: string; img_uri?: string; is_admin?: boolean };
type Course = Record<string, unknown>;

type StateKey = "token" | "profile" | "course" | "permissions";

interface AppState {
  token: Token | null;
  profile: Profile | null;
  course: Course | null;
  permissions: string[] | null;
  set: (key: StateKey, value: unknown) => void;
  invalidate: () => void;
}

const StateContext = createContext<AppState | null>(null);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<Token | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      try {
        setToken(JSON.parse(stored));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const set = useCallback((key: StateKey, value: unknown) => {
    switch (key) {
      case "token":
        setToken(value as Token);
        if (value) {
          localStorage.setItem(TOKEN_KEY, JSON.stringify(value));
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
        break;
      case "profile":
        setProfile(value as Profile);
        break;
      case "course":
        setCourse(value as Course);
        break;
      case "permissions":
        setPermissions(value as string[]);
        break;
    }
  }, []);

  const invalidate = useCallback(() => {
    setToken(null);
    setProfile(null);
    setCourse(null);
    setPermissions(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <StateContext.Provider value={{ token, profile, course, permissions, set, invalidate }}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used within a StateProvider");
  return ctx;
}
