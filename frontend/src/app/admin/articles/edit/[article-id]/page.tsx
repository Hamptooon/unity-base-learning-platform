'use client'
import { useParams } from 'next/navigation'
import { EditArticleForm } from '@/features/admin/article/edit/ui/edit-article-form'

export default function EditArticlePage() {
  const { 'article-id': articleId } = useParams()

  return (
    <div className="w-full p-5">
      <EditArticleForm
        articleId={articleId as string}
        title="Редактирование статьи"
        submitButtonText="Сохранить изменения"
      />
    </div>
  )
}
