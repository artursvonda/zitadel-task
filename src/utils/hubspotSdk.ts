import { User } from "next-auth";
import { randomUUID } from "node:crypto";

/**
 * This is totally fake HubSpot API code. Creating fake HubSpot API would be just too much of a work for no good reason in
 * context of this task. There's some overlap but a ton of properties are missing and all sorting / filtering is done client-side.
 */

enum TicketAssocationType {
	CONTACT = 16,
	COMPANY = 339,
}

type Association = {
	types: { associationCategory: "HUBSPOT_DEFINED" | "USER_DEFINED"; associationTypeId: number }[];
	to: { id: string };
};

type Properties = {
	zitadel_org_id: string;
	zitadel_org_primary_domain: string;
	subject: string;
	hs_pipeline_stage: string;
};

type Ticket = {
	id: string;
	associations: readonly Association[];
	properties: Properties;
	createdAt: Date;
	updatedAt: Date;
};

const tickets: Record<string, Ticket[]> = {};

export type TicketSearchArgs = {
	filter?: {
		stage?: string;
	};
	sort?: {
		property: string;
		direction: "asc" | "desc";
	};
};

const validSortFields = ["id", "organisation", "createdAt", "hs_pipeline_stage"];

export const getTickets = async (user: User, args: TicketSearchArgs) => {
	const all = tickets[user.id] ?? [];
	const results = args.filter?.stage
		? all.filter((ticket) => ticket.properties.hs_pipeline_stage === args.filter?.stage)
		: [...all]; // Ensuring a new array is created so inline sorting doesn't mess it up

	if (args.sort && validSortFields.includes(args.sort.property)) {
		const sortField = args.sort.property!;
		const sortDirection = args.sort.direction!;

		results.sort((a, b) => {
			switch (sortField) {
				case "id":
					return sortDirection === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
				case "organisation":
					const aOrg = a.properties.zitadel_org_primary_domain;
					const bOrg = b.properties.zitadel_org_primary_domain;

					return sortDirection === "asc" ? aOrg.localeCompare(bOrg) : bOrg.localeCompare(aOrg);
				case "createdAt":
					return sortDirection === "asc"
						? a.createdAt.getTime() - b.createdAt.getTime()
						: b.createdAt.getTime() - a.createdAt.getTime();
				case "hs_pipeline_stage":
					const aStage = a.properties.hs_pipeline_stage;
					const bStage = b.properties.hs_pipeline_stage;

					return sortDirection === "asc" ? aStage.localeCompare(bStage) : bStage.localeCompare(aStage);
				default:
					return 0;
			}
		});
	}

	return { results };
};

type TicketInput = {
	subject: string;
};

export const createTicket = async (user: User, input: TicketInput): Promise<Ticket> => {
	if (!tickets[user.id]) {
		tickets[user.id] = [];
	}

	const userTickets = tickets[user.id];

	const contactId = user.id;

	const properties: Properties = {
		zitadel_org_id: user.org.id,
		zitadel_org_primary_domain: user.org.primary_domain,
		subject: input.subject,
		hs_pipeline_stage: "1",
	};

	const ticket: Ticket = {
		id: randomUUID(),
		associations: [
			// Ticket to contact
			{
				types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: TicketAssocationType.CONTACT }],
				// in a real app we'd retrieve the contact ID from the HubSpot API
				to: { id: contactId },
			},
			// Ticket to company
			{
				types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: TicketAssocationType.COMPANY }],
				// in a real app we'd retrieve the company ID from the HubSpot API
				to: { id: user.org.id },
			},
		],
		properties,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	userTickets.push(ticket);

	return ticket;
};

export const updateTicketStage = async (user: User, ticketId: string, stageId: string) => {
	const userTickets = tickets[user.id];
	const ticket = userTickets.find((ticket) => ticket.id === ticketId);
	if (!ticket) {
		throw new Error(`Ticket not found: ${ticketId}`);
	}

	ticket.properties.hs_pipeline_stage = stageId;
	ticket.updatedAt = new Date();
};

const stages = [
	{
		label: "New",
		displayOrder: 0,
		metadata: {
			ticketState: "OPEN",
			isClosed: "false",
		},
		id: "1",
		createdAt: "1970-01-01T00:00:00Z",
		updatedAt: "1970-01-01T00:00:00Z",
		writePermissions: "CRM_PERMISSIONS_ENFORCEMENT",
		archived: false,
	},
	{
		label: "Waiting on contact",
		displayOrder: 1,
		metadata: {
			ticketState: "OPEN",
			isClosed: "false",
		},
		id: "2",
		createdAt: "1970-01-01T00:00:00Z",
		updatedAt: "1970-01-01T00:00:00Z",
		writePermissions: "CRM_PERMISSIONS_ENFORCEMENT",
		archived: false,
	},
	{
		label: "Waiting on us",
		displayOrder: 2,
		metadata: {
			ticketState: "OPEN",
			isClosed: "false",
		},
		id: "3",
		createdAt: "1970-01-01T00:00:00Z",
		updatedAt: "1970-01-01T00:00:00Z",
		writePermissions: "CRM_PERMISSIONS_ENFORCEMENT",
		archived: false,
	},
	{
		label: "Closed",
		displayOrder: 3,
		metadata: {
			ticketState: "CLOSED",
			isClosed: "true",
		},
		id: "4",
		createdAt: "1970-01-01T00:00:00Z",
		updatedAt: "1970-01-01T00:00:00Z",
		writePermissions: "CRM_PERMISSIONS_ENFORCEMENT",
		archived: false,
	},
];

export const getStages = async () => stages;

export const getStage = async (stageId: string) => {
	const stage = stages.find((stage) => stage.id === stageId);
	if (!stage) {
		throw new Error(`Stage not found: ${stageId}`);
	}

	return stage;
};
