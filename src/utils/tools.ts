import type { UserRole } from "@prisma/client";

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
