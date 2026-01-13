import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import type { RequestStatus, UserRole } from "@prisma/client";

export function getRequestStatus(status: RequestStatus) {
	let severity: AlertProps.Severity | undefined;
	let text = "";

	switch (status) {
		case "pending":
			severity = "warning";
			text = "En cours";
			break;
		case "under_instruction":
			severity = "info";
			text = "En cours";
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
			text = "Rejetée";
			break;
	}

	return { severity, text };
}

export function getUserRoleLabel(role: UserRole) {
	switch (role) {
		case "instructor":
			return "Utilisateur";
		case "admin":
			return "Instructeur";
		case "superadmin":
			return "Super administrateur";
		case "daj":
			return "DAJ";
		case "dpo":
			return "DPO";
		case "rssi":
			return "RSSI";
	}
}
