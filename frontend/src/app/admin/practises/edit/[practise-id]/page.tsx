'use client'
import { useParams } from 'next/navigation'
import { EditPracticeForm } from '@/features/admin/practise/edit/ui/edit-practice-form'

export default function EditPracticePage() {
  const { 'practise-id': practiseId } = useParams()

  return (
    <div className="w-full p-5">
      <EditPracticeForm
        practiceId={practiseId as string}
        title="Редактирование практики"
        submitButtonText="Сохранить изменения"
      />
    </div>
  )
}
