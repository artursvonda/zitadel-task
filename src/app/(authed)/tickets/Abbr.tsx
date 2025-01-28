"use client";

import { Tooltip } from "@mui/material";
import { HTMLAttributes, useState } from "react";

const CopyAbbr = ({ title }: HTMLAttributes<HTMLElement> & { title: string; children?: never }) => {
	const [isCopied, setIsCopied] = useState(false);

	return (
		<Tooltip title={isCopied ? "Copied to clipboard" : title} placement="top">
			<span
				onClick={() => {
					navigator.clipboard.writeText(title);
					setIsCopied(true);
					setTimeout(() => setIsCopied(false), 2_000);
				}}
			>
				{title.substring(0, 5)}...
			</span>
		</Tooltip>
	);
};

export default CopyAbbr;
