import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "../data/types";
import { demoIdentities } from "../data/seed";

interface Identity {
  name: string;
  detail: string;
  staffId?: string;
}

interface RoleState {
  role: Role | null;
  identity: Identity | null;
  signIn: (role: Role) => void;
  signOut: () => void;
}

const Ctx = createContext<RoleState | null>(null);
const KEY = "valour.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(
    () => (sessionStorage.getItem(KEY) as Role | null) ?? null,
  );

  const signIn = (r: Role) => {
    sessionStorage.setItem(KEY, r);
    setRole(r);
  };
  const signOut = () => {
    sessionStorage.removeItem(KEY);
    setRole(null);
  };

  const identity = role ? demoIdentities[role] : null;

  return <Ctx.Provider value={{ role, identity, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useRole(): RoleState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRole must be used within RoleProvider");
  return v;
}
