import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Autocomplete from "@mui/material/Autocomplete";

type MySearchInputProps = {
	className?: string;
	id: string;
	placeholder: string;
	options: { value: number; label: string }[];
	type: "search";
	setSearch: (value: string) => void;
	onSelect: (id: number | undefined) => void;
	isLoading?: boolean;
	disabled?: boolean;
};

function CustomAutocomplete(props: MySearchInputProps) {
	const {
		className,
		id,
		placeholder,
		type,
		options,
		setSearch,
		onSelect,
		isLoading,
		disabled,
	} = props;

	return (
		<Autocomplete
			options={options}
			id={id}
			style={{ width: "100%" }}
			noOptionsText="Aucun résultat"
			loading={isLoading}
			onChange={(_, newValue) => {
				if (newValue) onSelect(newValue.value);
			}}
			onInputChange={(_, newInputValue) => {
				if (newInputValue === "") onSelect(undefined);
				setSearch(newInputValue);
			}}
			getOptionKey={(option) => option.value}
			getOptionLabel={(option) => option.label}
			clearIcon="ri-arrow-right-s-fill"
			disabled={disabled}
			renderInput={(params) => (
				<div ref={params.InputProps.ref}>
					<input
						{...params.inputProps}
						className={cx(params.inputProps.className, className)}
						placeholder={placeholder}
						type={type}
					/>
				</div>
			)}
		/>
	);
}

export default CustomAutocomplete;
