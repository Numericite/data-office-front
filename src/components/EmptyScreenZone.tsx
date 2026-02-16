import { tss } from "tss-react";
import type { ReactNode } from "react";

type Props = {
	children?: ReactNode;
};

export const EmptyScreenZone = (props: Props) => {
	const { children } = props;
	const { classes, cx } = useStyles();

	return <div className={cx(classes.container)}>{children}</div>;
};

const useStyles = tss.withName(EmptyScreenZone.name).create(() => ({
	container: {
		minHeight: "40vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
}));
