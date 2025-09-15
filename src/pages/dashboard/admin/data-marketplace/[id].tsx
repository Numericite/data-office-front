import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { BaseReferenceForm } from "~/utils/forms/reference/form";
import { useAppForm } from "~/utils/forms";
import {
	referenceFormDefaultValues,
	referenceSchema,
} from "~/utils/forms/reference/schema";
import { toast } from "sonner";

export default function AdminUpsertReference() {
	const router = useRouter();
	const { id } = router.query as { id: string };

	const isNew = Number.isNaN(Number.parseInt(id));

	const { mutateAsync: upsertReference } = api.reference.upsert.useMutation();

	const { data } = api.reference.getById.useQuery(Number.parseInt(id), {
		enabled: !isNew,
	});

	const form = useAppForm({
		defaultValues: data
			? { ...data, needPersonalData: false }
			: referenceFormDefaultValues,
		validators: {
			onSubmit: referenceSchema,
		},
		onSubmit: async (values) => {
			const referenceId = isNew ? undefined : Number.parseInt(id);
			await upsertReference({
				...values.value,
				id: referenceId,
			});
			toast.success(
				`La référence a bien été ${isNew ? "créée" : "mise à jour"}.`,
			);
			router.push("/dashboard/admin/data-marketplace");
		},
	});

	return (
		<div className={fr.cx("fr-mt-2w")}>
			<h1 className={fr.cx("fr-mt-4w")}>
				{data ? `Modifier la référence #${data.id}` : "Nouvelle référence"}
			</h1>
			<BaseReferenceForm form={form} />
		</div>
	);
}
