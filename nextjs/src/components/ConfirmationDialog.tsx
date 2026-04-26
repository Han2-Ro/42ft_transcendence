"use client";

import Button from "./Button";
import { Popup } from "./Popup";

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => void | Promise<void>;
};

export const ConfirmationDialog = ({
  open,
  onClose,
  title,
  onConfirm,
}: ConfirmationDialogProps) => {
  if (!open) {
    return null;
  }

  const onConfirmClicked = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Popup className="p-6" onClose={onClose}>
      <h2 className="text-xl pb-4">{title}</h2>
      <div className="flex flex-row gap-4">
        <Button
          className="flex-1 bg-background-primary"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button onClick={onConfirmClicked} className="flex-1">
          Confirm
        </Button>
      </div>
    </Popup>
  );
};
