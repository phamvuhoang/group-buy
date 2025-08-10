"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GroupCreationForm from "./GroupCreationForm";

interface GroupCreationModalProps {
  productId: string;
  trigger?: React.ReactNode;
  onSuccess?: (groupId: string) => void;
}

export default function GroupCreationModal({ productId, trigger, onSuccess }: GroupCreationModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (groupId: string) => {
    setOpen(false);
    if (onSuccess) {
      onSuccess(groupId);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="w-full">
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <GroupCreationForm
          productId={productId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
