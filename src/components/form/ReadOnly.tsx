import { tss } from "tss-react";

type ReadOnlyProps = {
	label: string;
	value: string;
};

const ReadOnly = ({ label, value }: ReadOnlyProps) => {
	const { classes } = useStyles();
	return (
		<div>
			<span className={classes.label}>{label}</span>
			<br />
			<span>{value || "-"}</span>
		</div>
	);
};

const useStyles = tss.create(() => ({
	label: {
		fontWeight: "bold",
	},
}));

export default ReadOnly;
