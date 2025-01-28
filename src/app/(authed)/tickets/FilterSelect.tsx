"use client";

import { Select as MuiSelect, type SelectProps } from "@mui/material";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

const Select = (props: SelectProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const formStatus = useFormStatus();

	return (
		<MuiSelect
			{...props}
			disabled={formStatus.pending}
			ref={ref}
			onChange={(e) => {
				const url = new URL(window.location.href);
				if (e.target.value === "") {
					url.searchParams.delete("stage");
				} else {
					url.searchParams.set("stage", e.target.value as string);
				}

				window.location.assign(url.toString());
			}}
		/>
	);
};

export default Select;
