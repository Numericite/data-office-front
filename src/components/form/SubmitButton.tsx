import { useFormContext } from "~/utils/form-schema";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export function SubscribeButton({ label }: { label: string }) {
  const { classes } = useStyles();
  const form = useFormContext();
  return (
    <div className={classes.buttonWrapper}>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button className={classes.button} disabled={isSubmitting}>
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
  button: {
    alignItems: "end",
  },
}));
