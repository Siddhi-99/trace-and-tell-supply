import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ShieldCheck } from "lucide-react";

/** Confirmation shown before MetaMask is asked to sign a transaction. */
export function ConfirmTxDialog({ open, onOpenChange, title, description, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: React.ReactNode; onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm" />
        <AlertDialog.Content className="card fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground"><ShieldCheck className="h-5 w-5" /></span>
          <AlertDialog.Title className="mt-4 text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="mt-2 text-sm text-muted-foreground">{description}</div>
          </AlertDialog.Description>
          <p className="mt-3 text-xs text-muted-foreground">MetaMask will open to sign this transaction on the blockchain.</p>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel className="btn btn-outline">Cancel</AlertDialog.Cancel>
            <AlertDialog.Action className="btn btn-primary" onClick={onConfirm}>Confirm & sign</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
