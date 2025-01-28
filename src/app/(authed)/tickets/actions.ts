"use server";

import { createTicket, updateTicketStage } from "@/utils/hubspotSdk";
import { User } from "next-auth";
import { revalidateTag } from "next/cache";

export async function handleSubmit(user: User, _prevState: unknown, formData: FormData) {
	const subject = formData.get("subject") as string;

	if (!subject) {
		return {
			errors: {
				subject: "Subject is required",
			},
		};
	}

	await createTicket(user, {
		subject,
	});

	revalidateTag("tickets");

	return { errors: {} };
}

export async function handleChangeStage(user: User, formData: FormData) {
	const stageId = formData.get("stageId") as string;
	const ticketId = formData.get("ticketId") as string;

	await updateTicketStage(user, ticketId, stageId);

	revalidateTag("tickets");
}
