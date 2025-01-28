"use client";

import { Select as MuiSelect, SelectProps } from "@mui/material";
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
			onChange={() => {
				// Need extra tick it seems with MaterialUI. Otherwise old value gets submitted.
				setTimeout(() => {
					// MaterialUI is a bit weird and doesn't give us any way to element. So I just got ref to html element and find closest form.
					ref.current?.closest("form")?.requestSubmit();
				}, 0);
			}}
		/>
	);
};

export default Select;
