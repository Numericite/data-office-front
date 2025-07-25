import Head from "next/head";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { authClient } from "~/utils/auth-client";
import { useRouter } from "next/router";
import { createFormHook } from "@tanstack/react-form";
import { TextField } from "~/components/form/TextField";
import { fieldContext, formContext } from "~/utils/form";

const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
	},
	formComponents: {},
});

export default function ListRequests() {
	const router = useRouter();

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async (values) => {
			const { email, password } = values.value;

			const { data, error } = await authClient.signIn.email({
				email,
				password,
			});

			if (error) {
				console.error("Error signing in:", error);
			} else {
				console.log("Sign in successful:", data);
			}
			router.push("/admin/requests");
		},
	});

	return (
		<>
			<Head>
				<title>DCF - Accueil</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<div className={fr.cx("fr-mt-4w")}>
					<h1>Se connecter</h1>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<form.AppField
							name="email"
							children={(field) => (
								<field.TextField label="Email" kind="email" />
							)}
						/>
						<form.AppField
							name="password"
							children={(field) => (
								<field.TextField label="Mot de passe" kind="password" />
							)}
						/>
						<Button type="submit" className={fr.cx("fr-mt-2w")}>
							Se connecter
						</Button>
					</form>
				</div>
			</main>
		</>
	);
}
