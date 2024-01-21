import { ErrorMessage } from "@hookform/error-message";
import { type FieldErrors, type FieldName } from "react-hook-form";
import { type FieldValuesFromFieldErrors } from "@hookform/error-message/dist/types";
import { cn } from "@/lib/utils";

type ErrorFieldProps<TFieldErrors extends FieldErrors> = {
  errors: TFieldErrors;
  name: FieldName<FieldValuesFromFieldErrors<TFieldErrors>>;
  className?: string;
};

const ErrorField = <TFieldErrors extends FieldErrors>({
  errors,
  name,
  className,
}: ErrorFieldProps<TFieldErrors>) => {
  return (
    <ErrorMessage
      name={name}
      errors={errors}
      render={({ message }) => (
        <small className={cn("text-red-500", className)}>{message}</small>
      )}
    />
  );
};

export default ErrorField;
