'use client'
import { Skeleton } from '@/shared/ui/skeleton'
import { PracticeCard } from './practise-card'
import { StandalonePractice } from '@/entities/practise/model/types'

interface PracticeListProps {
  practices: StandalonePractice[]
  loading: boolean
  error: string
  onDeletePractice: (practiceId: string) => void
  onPublishPractice: (practiceId: string) => void
  onHidePractice: (practiceId: string) => void
}

export const PracticeList = ({
  practices,
  loading,
  error,
  onDeletePractice,
  onPublishPractice,
  onHidePractice
}: PracticeListProps) => {
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  } else if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {practices.map(practice => (
        <PracticeCard
          key={practice.id}
          practice={practice}
          onDelete={onDeletePractice}
          onPublish={onPublishPractice}
          onHide={onHidePractice}
        />
      ))}
    </div>
  )
}
