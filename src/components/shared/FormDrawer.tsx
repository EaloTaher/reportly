import type { ReactNode } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type FormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: FormDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
      // Vaul's input repositioning fights the iOS keyboard and can dismiss the
      // drawer mid-typing; the content scrolls on its own instead.
      repositionInputs={false}
    >
      <DrawerContent className="mx-auto max-w-lg data-[vaul-drawer-direction=bottom]:max-h-[92vh]">
        <DrawerHeader className="text-start">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : (
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="scroll-pb-24 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
