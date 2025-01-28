"use client";

import { SessionProvider as BaseSessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

type SessionProviderProps = {
	children: ReactNode;
};

export default function SessionProvider({ children }: SessionProviderProps) {
	return <BaseSessionProvider>{children}</BaseSessionProvider>;
}
