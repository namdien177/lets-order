import { memo } from "react";

const ChangedLabel = memo(() => {
  return (
    <div
      className={
        "absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 transform rounded-lg bg-yellow-500"
      }
    ></div>
  );
});

ChangedLabel.displayName = "ChangedLabel";

export default ChangedLabel;
