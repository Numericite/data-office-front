import type { UserRole } from "@prisma/client";

export function getUserRoleLabel(role: UserRole) {
	switch (role) {
		case "instructor":
			return "Utilisateur";
		case "admin":
			return "Instructeur";
		case "superadmin":
			return "Super administrateur";
	}
}
