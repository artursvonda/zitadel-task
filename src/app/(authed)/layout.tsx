"use client";

import { useSession, signIn } from "next-auth/react";
import { type ReactNode } from "react";
import SessionProvider from "../components/SessionProvider";

type AuthedLayout = {
	children: ReactNode;
};

const RedirectUnauthed = ({ children }: AuthedLayout) => {
	useSession({
		required: true,
		onUnauthenticated: () => {
			signIn();
		},
	});

	return children;
};

export default function AuthedLayout({ children }: AuthedLayout) {
	return (
		<SessionProvider>
			<RedirectUnauthed>{children}</RedirectUnauthed>
		</SessionProvider>
	);
}
