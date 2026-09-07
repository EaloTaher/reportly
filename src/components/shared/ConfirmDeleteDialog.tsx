import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useI18n } from "@/i18n/I18nProvider"

type ConfirmDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirming?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirming,
}: ConfirmDeleteDialogProps) {
  const { t } = useI18n()
  const cancelLabel = t.common.cancel
  const deleteLabel = t.common.delete
  const deletingLabel = t.common.deleting
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11" disabled={confirming}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11"
            variant="destructive"
            disabled={confirming}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {confirming ? deletingLabel : deleteLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
