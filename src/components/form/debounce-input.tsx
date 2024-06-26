import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useState,
} from "react";
import useDebounce, { type OptionProps } from "@/lib/hooks/useDebounce";
import { Input } from "@/components/ui/input";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  value?: string;
  onDebouncedChange?: (value: string) => void;
  debounceOptions?: OptionProps;
};

const DebouncedInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, onDebouncedChange, debounceOptions, value, ...props }, ref) => {
    const [rawKeyword, setKeyword] = useState<string>(value ?? "");
    const keyword = useDebounce(rawKeyword, debounceOptions);

    useEffect(() => {
      onDebouncedChange?.(keyword);
    }, [keyword, onDebouncedChange]);

    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => {
          setKeyword(e.target.value);
          onChange?.(e);
        }}
        ref={ref}
      />
    );
  },
);

DebouncedInput.displayName = "DebouncedInput";

export default DebouncedInput;
