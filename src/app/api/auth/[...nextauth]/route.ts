import NextAuth, { type DefaultSession, type AuthOptions } from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";

declare module "next-auth" {
	export interface Profile {
		"urn:zitadel:iam:user:resourceowner:id": string;
		"urn:zitadel:iam:user:resourceowner:name": string;
		"urn:zitadel:iam:user:resourceowner:primary_domain": string;
	}

	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			id: string;
			org: {
				id: string;
				name: string;
				primary_domain: string;
			};
		} & DefaultSession["user"];
	}

	interface User {
		org: {
			id: string;
			name: string;
			primary_domain: string;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		org_id?: string;
		org_name?: string;
		org_primary_domain?: string;
	}
}

export const authOptions: AuthOptions = {
	debug: true,
	session: {
		strategy: "jwt",
	},
	callbacks: {
		jwt({ token, user }) {
			return {
				org_id: user?.org?.id,
				org_name: user?.org?.name,
				org_primary_domain: user?.org?.primary_domain,
				...token,
			};
		},
		session({ session, token }) {
			if (!session.user.id && token.sub) {
				session.user.id = token.sub;
			}
			if (!session.user.org && token.org_id && token.org_name && token.org_primary_domain) {
				session.user.org = {
					id: token.org_id,
					name: token.org_name,
					primary_domain: token.org_primary_domain,
				};
			}

			return session;
		},
	},
	providers: [
		ZitadelProvider({
			issuer: process.env.ZITADEL_ISSUER,
			clientId: process.env.ZITADEL_CLIENT_ID ?? "",
			clientSecret: process.env.ZITADEL_CLIENT_SECRET ?? "",
			authorization: {
				params: {
					scope: "openid profile email urn:zitadel:iam:user:resourceowner",
				},
			},
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					org: {
						id: profile["urn:zitadel:iam:user:resourceowner:id"],
						name: profile["urn:zitadel:iam:user:resourceowner:name"],
						primary_domain: profile["urn:zitadel:iam:user:resourceowner:primary_domain"],
					},
				};
			},
		}),
	],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
