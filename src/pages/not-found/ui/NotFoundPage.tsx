import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { Button, EmptyState } from '@shared/ui';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<Compass size={28} />}
      title="Страница не найдена"
      description="Такого адреса нет. Вернитесь к списку досок."
      action={
        <Link to="/">
          <Button variant="primary">К доскам</Button>
        </Link>
      }
    />
  );
}
