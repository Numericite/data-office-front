import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import type { RequestStatus } from "@prisma/client";

export function getRequestStatus(status: RequestStatus) {
	let severity: AlertProps.Severity | undefined;
	let text = "";

	switch (status) {
		case "pending":
			severity = "info";
			text = "En attente";
			break;
		case "under_instruction":
			severity = "info";
			text = "En cours d'instruction";
			break;
		case "instructed":
			severity = "info";
			text = "Instruite";
			break;
		case "validated":
			severity = "success";
			text = "Validée";
			break;
		case "closed":
			severity = "error";
			text = "Rejeté";
			break;
	}

	return { severity, text };
}
