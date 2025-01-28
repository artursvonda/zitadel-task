"use client";

import { useActionState } from "react";
import { handleSubmit } from "./actions";
import Form from "next/form";
import { Button, Grid2 as Grid, TextField } from "@mui/material";
import { User } from "next-auth";

type CreateTicketFormProps = {
	user: User;
};

const CreateTicketForm = ({ user }: CreateTicketFormProps) => {
	const [state, formAction] = useActionState(handleSubmit.bind(null, user), { errors: {} });

	return (
		<Form action={formAction}>
			<Grid container direction="column" gap={2}>
				<Grid offset={3} size={6}>
					<TextField
						name="subject"
						fullWidth
						label="Subject"
						helperText={state?.errors.subject ?? " "}
						error={!!state?.errors.subject}
					/>
				</Grid>
				<Grid offset={3} size={6}>
					<Button type="submit" variant="contained" color="primary">
						Create ticket
					</Button>
				</Grid>
			</Grid>
		</Form>
	);
};

export default CreateTicketForm;
