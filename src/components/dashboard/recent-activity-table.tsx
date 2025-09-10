import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivityData } from '@/lib/mock-data';
import Image from 'next/image';

export function RecentActivityTable() {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return names[0].substring(0, 2);
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          Log das últimas ações realizadas no portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead className="text-right">Horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivityData.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                       <AvatarImage asChild src={activity.user.avatarUrl} alt={activity.user.name}>
                          <Image src={activity.user.avatarUrl} alt={activity.user.name} width={32} height={32} data-ai-hint="person" />
                       </AvatarImage>
                      <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{activity.user.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {activity.action}{' '}
                  <span className="font-semibold text-primary/90">
                    &quot;{activity.target}&quot;
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {activity.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
