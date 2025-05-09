'use client'
import { useState, useRef, useEffect, memo } from 'react'
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { UploadCloud } from 'lucide-react'
interface InputImageUploadProps {
  fieldName: string
  previewImageUrl?: string
}
export const InputImageUpload: React.FC<InputImageUploadProps> = memo(
  ({ fieldName, previewImageUrl }: InputImageUploadProps) => {
    console.log('fieldName', fieldName)
    console.log('previewImageUrl', previewImageUrl)
    const [previewUrl, setPreviewUrl] = useState<string | null>(
      previewImageUrl ?? null
    )
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { control } = useFormContext()
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(file)
      }
    }
    // useEffect(() => {
    //   if (previewImageUrl) {
    //     setPreviewUrl(previewImageUrl)
    //   }
    // }, [previewImageUrl])
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
                {previewUrl ? (
                  <img
                    src={
                      previewUrl?.startsWith('data:')
                        ? previewUrl
                        : `${process.env.NEXT_PUBLIC_API_STATIC_URL}${previewUrl}`
                    }
                    alt="Предпросмотр"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-4 h-60 flex flex-col items-center justify-center text-center ">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Нажмите для загрузки изображения
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    field.onChange(e.target.files)
                    handleImageUpload(e)
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
)
