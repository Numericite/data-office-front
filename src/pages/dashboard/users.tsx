import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import { UserRole, type User } from "@prisma/client";
import DsfrTable from "~/components/DsfrTable";
import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import type { Session } from "~/utils/auth-client";
import { Select } from "@codegouvfr/react-dsfr/Select";
import z from "zod";
import { getUserRoleLabel } from "~/utils/tools";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { auth } from "~/utils/auth";

type UserForTable = Pick<User, "id" | "email" | "name" | "role">;

const columnHelper = createColumnHelper<UserForTable>();
const numberPerPage = 10;

const modal = createModal({
	id: "delete-user-modal",
	isOpenedByDefault: false,
});

export default function Users({
	session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const [currentPage, setCurrentPage] = useState(1);
	const [userToDelete, setUserToDelete] = useState<UserForTable | null>(null);

	const sessionUserId = Number.parseInt(session?.user?.id ?? "");

	const { mutateAsync: updateUsers } = api.user.update.useMutation();
	const { mutateAsync: deleteUsers } = api.user.delete.useMutation();

	const { data: totalCount } = api.user.getCount.useQuery(undefined, {
		initialData: 0,
	});

	const { data, refetch } = api.user.getList.useQuery({
		page: currentPage,
		numberPerPage,
	});

	const handleUpdate = async (id: number, role: User["role"]) => {
		await updateUsers([{ id, role }]);
		refetch();
	};

	const handleDelete = async (id: number) => {
		await deleteUsers([id]);
		setCurrentPage(1);
		refetch();
	};

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("email", {
			header: "Email",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("name", {
			header: "Nom",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("role", {
			header: "Rôle",
			cell: (info) => (
				<Select
					label=""
					nativeSelectProps={{
						value: info.getValue(),
						onChange: (e) =>
							handleUpdate(
								info.row.original.id,
								e.target.value as User["role"],
							),
					}}
					disabled={info.row.original.id === sessionUserId}
				>
					{z.enum(UserRole).options.map((role) => (
						<option key={role} value={role}>
							{getUserRoleLabel(role)}
						</option>
					))}
				</Select>
			),
		}),
		columnHelper.display({
			id: "Actions",
			header: "Actions",
			cell: (info) =>
				info.row.original.id !== sessionUserId ? (
					<Button
						iconId="fr-icon-delete-bin-fill"
						onClick={() => {
							setUserToDelete(info.row.original);
							modal.open();
						}}
						size="small"
						priority="tertiary"
						title="Supprimer"
					/>
				) : (
					"-"
				),
		}),
	];

	return (
		<>
			<div className={fr.cx("fr-mt-4w")}>
				<h1>Liste des utilisateurs</h1>
			</div>
			<DsfrTable<UserForTable>
				data={data ?? []}
				columns={columns}
				totalCount={totalCount}
				pagination={{
					numberPerPage,
					currentPage,
					setCurrentPage,
				}}
			/>
			<modal.Component
				title="Confirmer la suppression"
				buttons={[
					{
						children: "Confirmer",
						onClick: () => {
							if (userToDelete) handleDelete(userToDelete.id);
							modal.close();
						},
					},
				]}
			>
				<p>
					Êtes-vous sûr de vouloir supprimer "{userToDelete?.name} (
					{userToDelete?.email})" comme utilisateur ?
				</p>
			</modal.Component>
		</>
	);
}

export const getServerSideProps = (async (context) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	try {
		const session = await auth.api.getSession({
			headers: context.req.headers as unknown as Headers,
		});

		if (!session || session.user.role !== "superadmin") {
			return { redirect };
		}

		return { props: { session } };
	} catch (error) {
		console.error("Error fetching suppliers:", error);
		return { redirect };
	}
}) satisfies GetServerSideProps<{ session: Session }>;
