import { ErrorMessage } from "@hookform/error-message";
import { cn } from "@/lib/utils";

type ErrorFieldProps = Omit<
  Parameters<typeof ErrorMessage>[0],
  "render" | "as"
> & {
  className?: string;
};

const ErrorField = ({ errors, name, className, ...props }: ErrorFieldProps) => {
  return (
    <ErrorMessage
      {...props}
      name={name}
      errors={errors}
      render={({ message }) => (
        <small className={cn("text-red-500", className)}>{message}</small>
      )}
    />
  );
};

export default ErrorField;
