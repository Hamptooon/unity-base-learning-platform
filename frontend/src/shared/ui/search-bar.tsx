'use client'

import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { SearchIcon } from 'lucide-react'
import { forwardRef, type ComponentProps } from 'react'

interface SearchBarProps extends ComponentProps<'input'> {
  placeholder?: string
  className?: string
  onSearch?: (value: string) => void
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ placeholder = 'Search...', className, onSearch, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const searchValue = formData.get('search') as string
      onSearch?.(searchValue)
    }

    return (
      <form onSubmit={handleSubmit} className="relative w-full">
        <Input
          ref={ref}
          name="search"
          placeholder={placeholder}
          className={cn('pr-10', className)}
          {...props}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full rounded-l-none"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </form>
    )
  }
)

SearchBar.displayName = 'SearchBar'

export { SearchBar }
