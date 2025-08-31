'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { useState, useEffect } from 'react'
import { complaintService } from '@/entities/complaint/api/complaint.service'
import { Button } from '@/shared/ui/button'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import CourseComplaints from '@/entities/complaint/ui/course-complaints'
import PractiseComplaints from '@/entities/complaint/ui/practises-complaints'

import { ComplaintReview } from '@/entities/complaint/model/types'

export default function ComplaintsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Жалобы</h1>
        <p className="text-muted-foreground">
          Информация о жалобах на ревью пользователей
        </p>
      </div>

      <Tabs defaultValue="review">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="site">Работа сайта</TabsTrigger>
          <TabsTrigger value="review">Челленджи</TabsTrigger>
          <TabsTrigger value="course">Курсы</TabsTrigger>
        </TabsList>
        <TabsContent value="site" className="mt-6 space-y-4">
          Жалобы на работу и контент сайта
        </TabsContent>
        <TabsContent value="course" className="mt-6 space-y-4">
          <CourseComplaints />
        </TabsContent>
        <TabsContent value="review" className="mt-6 space-y-4">
          <PractiseComplaints />
        </TabsContent>
      </Tabs>
    </div>
  )
}
