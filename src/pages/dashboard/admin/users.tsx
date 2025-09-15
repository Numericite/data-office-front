import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import type { User } from "@prisma/client";
import DsfrTable from "~/components/DsfrTable";
import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { authClient } from "~/utils/auth-client";
import { Select } from "@codegouvfr/react-dsfr/Select";

type UserForTable = Pick<User, "id" | "email" | "name" | "role">;

const columnHelper = createColumnHelper<UserForTable>();
const numberPerPage = 10;

const modal = createModal({
	id: "delete-user-modal",
	isOpenedByDefault: false,
});

export default function AdminHome() {
	const [currentPage, setCurrentPage] = useState(1);
	const [userToDelete, setUserToDelete] = useState<UserForTable | null>(null);

	const { data: session } = authClient.useSession();

	const { mutateAsync: deleteUsers } = api.user.delete.useMutation();

	const { data: totalCount } = api.user.getCount.useQuery(undefined, {
		initialData: 0,
	});

	const { data, refetch } = api.user.getList.useQuery({
		page: currentPage,
		numberPerPage,
	});

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
				<Select label="" nativeSelectProps={{ value: info.getValue() }}>
					<option value="SUPERADMIN">Super Administrateur</option>
					<option value="ADMIN">Administrateur</option>
					<option value="USER">Utilisateur</option>
				</Select>
			),
		}),
		columnHelper.display({
			id: "Actions",
			header: "Actions",
			cell: (info) =>
				session?.user?.id &&
				info.row.original.id !== Number.parseInt(session.user.id) && (
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
