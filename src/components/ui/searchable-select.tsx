'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface Option {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string | number | null
  onChange: (value: string | number | null) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  maxItems?: number
  clearable?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  className,
  maxItems = 10,
  clearable = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(o => o.value === value)

  const filtered = options
    .filter(o => o.label.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .slice(0, maxItems)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    if (!open) {
      setSearch('')
    }
  }, [open])

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition-all duration-150 hover:border-slate-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 data-open:border-cyan-400 data-open:ring-2 data-open:ring-cyan-500/20',
          !selectedOption && 'text-slate-400',
          className,
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && selectedOption && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="flex items-center justify-center rounded-md p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} className="text-slate-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="min-w-(--anchor-width) max-w-[420px] p-2">
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 mb-1"
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        <div className="max-h-64 min-h-[100px] overflow-y-auto">
          {filtered.map(option => (
            <button
              key={String(option.value)}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-left transition-colors duration-100',
                option.value === value
                  ? 'bg-cyan-50 text-cyan-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              <span className="flex-1 whitespace-normal break-words text-left">{option.label}</span>
              {option.value === value && (
                <Check size={14} className="text-cyan-500 shrink-0" />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-slate-400">
              {debouncedSearch ? 'No results found' : 'No options available'}
            </p>
          )}
        </div>
        {options.length > maxItems && filtered.length >= maxItems && (
          <p className="text-xs text-slate-400 text-center pt-1.5 border-t border-slate-100 mt-1">
            Showing {maxItems} of {options.length}. Type to search.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
