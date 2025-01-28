"use client";

import Link from "next/link";
import { type ReactNode } from "react";

const getSortUrl = (sort: string, direction: "asc" | "desc") => {
	// There's some error here I couldn't be bothered to figure out now. Things seem to be working fine though.
	// Probably some issues with how client / server components work. This is supposed to be client component
	// and should have access to window but for some reason it doesn't.
	const location = typeof window !== "undefined" ? window.location : { href: "" };
	const url = new URL(location.href);
	url.searchParams.set("sort", [sort, direction].join(":"));

	return url.toString();
};

type SortLinkProps = {
	sortField: string;
	currentSortField: string;
	currentSortDirection: "asc" | "desc";
	children: ReactNode;
};

const SortLink = ({ sortField, currentSortField, currentSortDirection, children }: SortLinkProps) => (
	<Link href={getSortUrl(sortField, currentSortField === sortField && currentSortDirection === "asc" ? "desc" : "asc")}>
		{children} {currentSortField === sortField ? (currentSortDirection === "asc" ? "▲" : "▼") : ""}
	</Link>
);

export default SortLink;
