import { getServerSession } from "next-auth/next";
import { unstable_cache } from "next/cache";
import Form from "next/form";
import {
	Container,
	Grid2 as Grid,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from "@mui/material";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStages, getTickets as baseGetTickets } from "@/utils/hubspotSdk";

import Abbr from "./Abbr";
import { handleChangeStage } from "./actions";
import Select from "./Select";
import FilterSelect from "./FilterSelect";
import SortLink from "./SortLink";
import CreateTicketForm from "./CreateTicketForm";

const getTickets = unstable_cache(baseGetTickets, ["tickets"], { revalidate: 3600, tags: ["tickets"] });

type SearchParams = Promise<{ stage?: string; sort?: `${string}:${"asc" | "desc"}` }>;

export default async function Tickets(props: { searchParams: SearchParams }) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return null;
	}
	const { user } = session;

	const { stage: stageFilter = "", sort: sortRaw = "" } = await props.searchParams;
	const [sort, sortDirection = "asc"] = sortRaw.split(":") as [string, "asc" | "desc" | undefined];

	const { results: tickets } = await getTickets(user, {
		filter: { stage: stageFilter },
		sort: sort && sortDirection ? { property: sort, direction: sortDirection } : undefined,
	});
	const stages = await getStages();

	return (
		<Container>
			<Stack spacing={5}>
				<Typography alignSelf="end">Hello, {user.name}!</Typography>
				<Typography variant="h1">Tickets</Typography>
				<Paper>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell width="100px">
									<SortLink sortField="id" currentSortField={sort} currentSortDirection={sortDirection}>
										ID
									</SortLink>
								</TableCell>
								<TableCell width="20%">
									<SortLink sortField="organisation" currentSortField={sort} currentSortDirection={sortDirection}>
										Organisation
									</SortLink>
								</TableCell>
								<TableCell width="20%">
									<SortLink sortField="createdAt" currentSortField={sort} currentSortDirection={sortDirection}>
										Created At
									</SortLink>
								</TableCell>
								<TableCell width="20%">
									<SortLink sortField="stage" currentSortField={sort} currentSortDirection={sortDirection}>
										Stage
									</SortLink>{" "}
									<FilterSelect size="small" value={stageFilter} displayEmpty>
										<MenuItem value="">All</MenuItem>
										{stages.map((stage) => (
											<MenuItem key={stage.id} value={stage.id}>
												{stage.label}
											</MenuItem>
										))}
									</FilterSelect>
								</TableCell>
								<TableCell>Description</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{tickets.map((ticket) => (
								<TableRow key={ticket.id}>
									<TableCell>
										<Abbr title={ticket.id} />
									</TableCell>
									<TableCell>
										<Tooltip title={ticket.properties.zitadel_org_id}>
											<span>{ticket.properties.zitadel_org_primary_domain}</span>
										</Tooltip>
									</TableCell>
									<TableCell>{ticket.createdAt.toLocaleString("en-UK")}</TableCell>
									<TableCell>
										<Form action={handleChangeStage.bind(null, user)}>
											<input type="hidden" name="ticketId" value={ticket.id} />
											<Select
												name="stageId"
												defaultValue={ticket.properties.hs_pipeline_stage}
												size="small"
												key={ticket.properties.hs_pipeline_stage}
											>
												{stages.map((stage) => (
													<MenuItem key={stage.id} value={stage.id}>
														{stage.label}
													</MenuItem>
												))}
											</Select>
										</Form>
									</TableCell>
									<TableCell>{ticket.properties.subject}</TableCell>
								</TableRow>
							))}
							{tickets.length === 0 && (
								<TableRow>
									<TableCell colSpan={5}>No tickets found</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Paper>
				<Paper>
					<Grid container direction="column" gap={2}>
						<Grid offset={3} size={6}>
							<Typography variant="h2">Add new ticket</Typography>
						</Grid>
						<CreateTicketForm user={user} />
					</Grid>
				</Paper>
			</Stack>
		</Container>
	);
}
