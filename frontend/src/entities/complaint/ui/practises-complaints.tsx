'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { useState, useEffect } from 'react'
import { complaintService } from '@/entities/complaint/api/complaint.service'
import { Button } from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { ComplaintReview } from '@/entities/complaint/model/types'

export default function PractiseComplaints() {
  const [complaints, setComplaints] = useState<ComplaintReview[]>([])

  useEffect(() => {
    const fetchComplaints = async () => {
      const data = await complaintService.getComplaintsPractises()
      setComplaints(data)
    }
    fetchComplaints()
  }, [])

  const handleRejectComplaint = async (id: string) => {
    try {
      await complaintService.rejectComplaintPractise(id)
      toast.success('Жалоба отклонена')
      setComplaints(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      toast.error('Ошибка при отклонении жалобы')
    }
  }

  const handleAcceptComplaint = async (id: string) => {
    try {
      await complaintService.acceptComplaintPractise(id)
      toast.success('Жалоба принята')
      setComplaints(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      toast.error('Ошибка при принятии жалобы')
    }
  }

  return (
    <Tabs defaultValue="review">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="solution">Решения</TabsTrigger>
        <TabsTrigger value="review">Ревью заданий</TabsTrigger>
      </TabsList>
      <TabsContent value="solution" className="mt-6 space-y-4">
        Жалобы на решения пользователей (неккореткные решения, оскорбления в
        комментарии к решению)
      </TabsContent>
      <TabsContent value="review" className="mt-6 space-y-4">
        {complaints.map(complaint => (
          <div key={complaint.id} className="border rounded-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {complaint.reviewedUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">
                    {complaint.reviewedUser.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {complaint.reviewedUser.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Одобрено жалоб: {complaint.approvedComplaintsCount}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="text-lg w-fit">
                  {complaint.reviewPractise.score}/5
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectComplaint(complaint.id)}
                  >
                    Отклонить
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptComplaint(complaint.id)}
                  >
                    Принять
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-medium mb-2">Жалоба</h5>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Тип:</span>{' '}
                    {complaint.complaintType}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Дата:</span>{' '}
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    <span className="font-medium">Комментарий:</span>{' '}
                    {complaint.comment}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Детали ревью</h5>

                <div className="space-y-4">
                  {complaint.reviewPractise.reviewPractiseScoreCriterias.map(
                    criteria => (
                      <div
                        key={criteria.reviewCriteria.title}
                        className="pl-4 border-l-4 border-primary"
                      >
                        <h5 className="font-medium">
                          {criteria.reviewCriteria.title}
                        </h5>
                        <p className="font-medium">
                          {criteria.reviewCriteria.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Оценка:
                          </span>
                          <Badge variant="secondary">{criteria.score}/5</Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {complaint.reviewPractise.comment && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">Комментарий ревьювера</h5>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {complaint.reviewPractise.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}
