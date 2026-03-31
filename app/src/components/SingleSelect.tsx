"use client";

import ReactSelect from "react-select";
import ClientOnly from "./ClientOnly";

type SelectOption<T extends string> = {
  id: T;
  name: string;
};

export default function SingleSelect<T extends string>({
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  isSearchable = false,
  isRequired = false,
}: {
  name: string;
  value: T | undefined;
  onChange: (newValue: T | undefined) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  isSearchable?: boolean;
  isRequired?: boolean;
}) {
  const actualValue = options.find((opt) => opt.id === value);

  return (
    <ClientOnly>
      <ReactSelect
        unstyled={true}
        className="react-select-container"
        classNamePrefix="react-select"
        isMulti={false}
        isSearchable={isSearchable}
        isClearable={!isRequired}
        required={isRequired}
        placeholder={placeholder}
        name={name}
        value={actualValue}
        onChange={(newValue) => onChange(newValue?.id ?? undefined)}
        getOptionValue={(option) => option.id}
        getOptionLabel={(option) => option.name}
        options={options}
      />
    </ClientOnly>
  );
}
