import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Slider } from '@/shared/ui/slider'
import { toast } from 'react-toastify'
import { useUser } from '@/features/auth/provider/user-provider'
import { reviewService } from '@/features/admin/course/api/review.service'
import { PracticeSubmission } from '@/entities/user/model/types'
// PeerReviewModal.tsx
interface PeerReviewModalProps {
  submission: PracticeSubmission
  onClose: () => void
  onSuccess: () => void
}

export const PeerReviewModal = ({
  submission,
  onClose,
  onSuccess
}: PeerReviewModalProps) => {
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(
    {}
  )
  console.log('submission', submission)
  const [comment, setComment] = useState('')
  const { user } = useUser()

  const handleSubmit = async () => {
    if (!user) return

    try {
      const scores = Object.entries(criteriaScores).map(
        ([criteriaId, value]) => ({
          criteriaId,
          value
        })
      )

      await reviewService.createReview({
        submissionId: submission.id,
        reviewerId: user.id,
        scores,
        comment
      })

      onSuccess()
      onClose()
      toast.success('Проверка успешно отправлена')
    } catch (error) {
      toast.error('Ошибка при отправке проверки')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Проверка решения</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">GitHub репозиторий:</h4>
            <a
              href={submission.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {submission.githubRepo}
            </a>
          </div>

          {submission.challenges && (
            <div>
              <h4 className="font-medium">Сложности:</h4>
              <p className="whitespace-pre-wrap">{submission.challenges}</p>
            </div>
          )}

          {submission.learned && (
            <div>
              <h4 className="font-medium">Изученное:</h4>
              <p className="whitespace-pre-wrap">{submission.learned}</p>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Критерии оценки</h3>
            {submission.part.practice?.reviewCriteria?.map(criteria => (
              <div key={criteria.id} className="space-y-2">
                <Label>{criteria.title}</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[criteriaScores[criteria.id] || 3]}
                    onValueChange={value =>
                      setCriteriaScores(prev => ({
                        ...prev,
                        [criteria.id]: value[0]
                      }))
                    }
                  />
                  <span className="w-8 text-center">
                    {criteriaScores[criteria.id] || 3}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {criteria.description}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Комментарий для автора</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Оставьте ваш комментарий..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>Отправить проверку</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
