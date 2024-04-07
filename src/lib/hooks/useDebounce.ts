import { useEffect, useState } from "react";

type OptionProps = {
  debouncedFor?: number;
  distinctChanges?: boolean;
};

const useDebounce = <T>(value: T, options?: OptionProps) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const debouncedFor = options?.debouncedFor ?? 300;
  const distinctChanges = options?.distinctChanges ?? false;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue((oldValue) => {
        if (distinctChanges && oldValue === value) {
          return oldValue;
        }

        return value;
      });
    }, debouncedFor);

    return () => {
      clearTimeout(timer);
    };
  }, [value, debouncedFor, distinctChanges]);

  return debouncedValue;
};

export default useDebounce;
