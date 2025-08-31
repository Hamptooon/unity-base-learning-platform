'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { X } from 'lucide-react'
import { axiosWithAuth } from '@/shared/api/axios'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tag } from '@/entities/tag/model/types'
import { tagService } from '@/entities/tag/api/tag.service'

export const TagInput = ({
  value,
  onChange,
  onDeleteTag
}: {
  value: Tag[]
  onChange: (tag: Tag) => void
  onDeleteTag: (tag: Tag) => void
}) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await tagService.getTags(inputValue)
        setSuggestions(data as Tag[])
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    if (inputValue) {
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [inputValue])

  const handleAddTag = (tagName: string) => {
    if (!value.some(t => t.name === tagName)) {
      console.log('Adding new tag:', tagName)
      const newTag: Tag = { id: Date.now().toString(), name: tagName }
      onChange(newTag)
    }

    console.log('tagName', tagName)
    setInputValue('')
    setOpen(false)
  }

  const handleRemoveTag = (tag: Tag) => {
    console.log('adasdada')
    onDeleteTag(tag)
  }
  const canCreateNew =
    inputValue.trim() &&
    !suggestions.some(
      tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    ) &&
    !value.some(
      tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    )
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="px-2 py-1 text-sm font-medium flex items-center gap-1"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Добавить теги..."
            onClick={() => setOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                console.log('inputValue', inputValue)
                e.preventDefault()
                handleAddTag(inputValue.trim())
              }
            }}
          />
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Добавить теги..."
            />
            <CommandList>
              <CommandGroup heading="Предложения">
                {suggestions.map(tag => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleAddTag(tag.name)}
                    className="cursor-pointer"
                  >
                    {tag.name}
                  </CommandItem>
                ))}

                {suggestions.length === 0 && !canCreateNew && (
                  <CommandEmpty>Нет совпадений</CommandEmpty>
                )}
                {canCreateNew && (
                  <CommandItem
                    key="create-new"
                    onSelect={() => handleAddTag(inputValue.trim())}
                    className="cursor-pointer font-semibold text-primary"
                  >
                    ➕ Добавить новый тег: "{inputValue.trim()}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
