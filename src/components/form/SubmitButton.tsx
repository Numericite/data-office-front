import { useFormContext } from "~/utils/form";
import { Button, type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

type SubscribeButtonProps = {
	label: string;
	iconId: ButtonProps.WithIcon["iconId"];
	iconPosition: ButtonProps["iconPosition"];
};

export function SubscribeButton({
	label,
	iconId,
	iconPosition,
}: SubscribeButtonProps) {
	const { classes } = useStyles();
	const form = useFormContext();
	return (
		<div className={classes.buttonWrapper}>
			<form.Subscribe
				selector={(state) => [state.isSubmitting, state.canSubmit]}
			>
				{([isSubmitting, canSubmit]) => (
					<Button
						iconId={iconId}
						iconPosition={iconPosition}
						disabled={isSubmitting || !canSubmit}
						type="submit"
					>
						{label}
					</Button>
				)}
			</form.Subscribe>
		</div>
	);
}

const useStyles = tss.withName(SubscribeButton.name).create(() => ({
	buttonWrapper: {
		display: "flex",
		justifyContent: "end",
	},
}));
