import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

export function Loader() {
	const { classes } = useStyles();

	return (
		<div className={classes.wrapper}>
			<div className={classes.loader} />
			<style>
				{`
        @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
        }
      `}
			</style>
		</div>
	);
}

const useStyles = tss.withName(Loader.name).create(() => ({
	wrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
		minHeight: "120px",
	},
	loader: {
		width: "70px",
		height: "70px",
		border: "4px solid #ccc",
		borderTop: `4px solid ${fr.colors.decisions.text.actionHigh.blueFrance.default}`,
		borderRadius: "50%",
		animation: "spin 1s linear infinite",
	},
}));

export default Loader;
