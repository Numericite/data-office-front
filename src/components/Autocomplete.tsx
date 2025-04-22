import Autocomplete from "@mui/material/Autocomplete";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

type MySearchInputProps = {
  className?: string;
  id: string;
  placeholder: string;
  options: { value: number; label: string }[];
  type: "search";
  setSearch: (value: string) => void;
  onSelect: (id: number) => void;
};

function CustomAutocomplete(props: MySearchInputProps) {
  const { className, id, placeholder, type, options, setSearch, onSelect } =
    props;

  return (
    <Autocomplete
      options={options}
      id={id}
      loading={options.length === 0}
      onChange={(_, newValue) => {
        if (newValue) onSelect(newValue.value);
      }}
      onInputChange={(_, newInputValue, reason) => {
        console.log("Input changed:", newInputValue, reason);
        if (newInputValue === "") onSelect(0);
        setSearch(newInputValue);
      }}
      getOptionKey={(option) => option.value}
      getOptionLabel={(option) => option.label}
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
