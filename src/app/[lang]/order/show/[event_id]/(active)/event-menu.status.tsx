type Props = {
  isSelected: boolean;
};

const EventMenuStatus = ({ isSelected }: Props) => {
  if (isSelected) {
    return (
      <div
        className={
          "w-20 rounded border border-transparent bg-destructive p-2 text-center text-xs transition group-hover:bg-destructive/50"
        }
      >
        Remove
      </div>
    );
  }
  return (
    <div
      className={
        "w-20 rounded border p-2 text-center text-xs text-muted-foreground transition group-hover:bg-accent"
      }
    >
      Select
    </div>
  );
};

export default EventMenuStatus;
