'use client'
import { useEffect, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
}

export default function BlockNoteEditor({
  initialContent = '',
  onChange
}: BlockNoteEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const editor = useCreateBlockNote()

  useEffect(() => {
    setIsClient(true)

    // Загрузка контента в редактор при монтировании компонента
    const loadInitialContent = async () => {
      if (initialContent) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialContent)
          editor.replaceBlocks(editor.document, blocks)
        } catch (error) {
          console.error('Ошибка при загрузке содержимого в редактор:', error)
        }
      }
    }

    loadInitialContent()
  }, [])

  // Обработчик изменений в редакторе
  const handleEditorChange = async () => {
    const html = (await editor.blocksToFullHTML(editor.document)) as string
    onChange(html)
  }

  if (!isClient) {
    return <div className="min-h-[400px] bg-gray-50"></div>
  }

  return (
    <BlockNoteView
      editor={editor}
      onChange={handleEditorChange}
      theme="light"
      className="min-h-[400px]"
    />
  )
}
