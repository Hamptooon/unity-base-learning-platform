import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/table'
import { Progress } from '@/shared/ui/progress'
import { Users2, BookOpen, Clock, FileCheck, ArrowUpRight } from 'lucide-react'

export default function AdminPage() {
  // Примерные данные (замените на реальные данные из вашего API)
  const stats = {
    totalUsers: 2345,
    activeCourses: 42,
    pendingReviews: 18,
    averageProgress: 65
  }

  const recentUsers = [
    { id: 1, name: 'Алексей Петров', email: 'alex@example.com', role: 'USER' },
    {
      id: 2,
      name: 'Мария Иванова',
      email: 'maria@example.com',
      role: 'PREMIUM'
    },
    { id: 3, name: 'Иван Сидоров', email: 'ivan@example.com', role: 'ADMIN' }
  ]

  const coursesProgress = [
    { course: 'Основы Unity', progress: 85 },
    { course: 'C# для начинающих', progress: 65 },
    { course: '3D моделирование', progress: 45 }
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Административная панель</h1>
        <div className="flex gap-4">
          <Button variant="outline">Настройки</Button>
          <Button>Создать новый курс</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% за месяц
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные курсы
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <div className="text-sm text-muted-foreground mt-2">
              5 новых на этой неделе
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Проверка работ
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Ожидают проверки
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прогресс</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <div className="text-sm text-muted-foreground mt-2">
              Средний прогресс по курсам
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Последние пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Роль</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={user.role === 'ADMIN' ? 'default' : 'outline'}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прогресс по курсам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {coursesProgress.map(course => (
              <div key={course.course} className="space-y-2">
                <div className="flex justify-between">
                  <div className="font-medium">{course.course}</div>
                  <div className="text-muted-foreground">
                    {course.progress}%
                  </div>
                </div>
                <Progress value={course.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние практические работы</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Курс</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Оценка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Основы Unity</TableCell>
                <TableCell>Алексей Петров</TableCell>
                <TableCell>
                  <Badge variant="destructive">На проверке</Badge>
                </TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>C# для начинающих</TableCell>
                <TableCell>Мария Иванова</TableCell>
                <TableCell>
                  <Badge>Завершено</Badge>
                </TableCell>
                <TableCell className="text-right">95/100</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
