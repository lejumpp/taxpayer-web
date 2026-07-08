import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface AddTransactionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddTransactionSheet({ open, onOpenChange }: AddTransactionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[20px] max-h-[90dvh] overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle>Add transaction</SheetTitle>
          <SheetDescription>
            Record a new income or expense.
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 py-8 text-center text-[13px] text-[#888780]">
          Transaction form coming soon.
        </div>
      </SheetContent>
    </Sheet>
  )
}
