import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
  isLoading?: boolean
  className?: string
}

export function SearchInput({ value, onChange, onSearch, placeholder, isLoading, className }: SearchInputProps) {
  return (
    <ButtonGroup className={cn('min-w-0', className)}>
      <InputGroup className="rounded-lg border-cream-border bg-gray-25">
        <InputGroupAddon>
          <Search className="size-3.5 text-gray-200" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          className="text-sm text-gray-900 placeholder:text-gray-200"
        />
        {isLoading && (
          <InputGroupAddon align="inline-end">
            <div className="size-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </InputGroupAddon>
        )}
      </InputGroup>
      <Button
        type="button"
        variant="outline"
        onClick={onSearch}
        className="rounded-lg border-cream-border bg-white text-sm text-gray-600 font-medium hover:bg-gray-50"
      >
        Search
      </Button>
    </ButtonGroup>
  )
}
