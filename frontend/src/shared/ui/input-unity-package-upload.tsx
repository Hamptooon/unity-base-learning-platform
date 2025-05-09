'use client'
import { useState, useRef, useEffect, memo } from 'react'
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { UploadCloud, Package } from 'lucide-react'

interface InputUnityPackageUploadProps {
  fieldName: string
  initialFileUrl?: string
}

export const InputUnityPackageUpload: React.FC<InputUnityPackageUploadProps> =
  memo(({ fieldName, initialFileUrl }: InputUnityPackageUploadProps) => {
    const [fileInfo, setFileInfo] = useState<{
      name: string
      size: string
    } | null>(null)
    console.log('initialFileUrl', initialFileUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { control } = useFormContext()

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      console.log('file', file)
      if (file) {
        if (file.name.endsWith('.unitypackage')) {
          setFileInfo({
            name: file.name,
            size: formatFileSize(file.size)
          })
        } else {
          // Обработка ошибки неверного формата
          e.target.value = ''
          setFileInfo(null)
        }
      }
    }

    useEffect(() => {
      if (initialFileUrl) {
        const fileName = initialFileUrl.split('/').pop() || ''
        setFileInfo({
          name: fileName,
          size: '' // Можно добавить запрос размера файла если необходимо
        })
      }
    }, [initialFileUrl])

    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div
                className="relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {fileInfo ? (
                  <div className="border-2 border-dashed rounded-lg p-4 h-40 flex flex-col items-center justify-center text-center">
                    <Package className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">{fileInfo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fileInfo.size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Нажмите для изменения файла
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-4 h-40 flex flex-col items-center justify-center text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Нажмите для загрузки .unitypackage
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept=".unitypackage"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    field.onChange(e.target.files)
                    handleFileUpload(e)
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  })
