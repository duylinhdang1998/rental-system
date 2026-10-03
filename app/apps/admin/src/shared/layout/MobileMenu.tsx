import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogTitle } from '@/components/ui/dialog-title';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogTrigger } from '@/components/ui/dialog-trigger';
import { useSession } from '@/features/auth/hooks/use-session';
import { LogoutButton } from '@/shared/layout/LogoutButton';
import { WorkspaceNavigation } from '@/shared/layout/WorkspaceNavigation';

export function MobileMenu() {
  const { t } = useTranslation();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button aria-label={t('openNavigation')} size="icon" variant="ghost">
          <Menu aria-hidden className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm" closeLabel={t('close')}>
        <DialogTitle className="pr-10">{t('navigation')}</DialogTitle>
        <DialogDescription>
          {user.name} · {t(`roles.${user.role}`)}
        </DialogDescription>
        <WorkspaceNavigation onNavigate={() => setOpen(false)} role={user.role} />
        <LogoutButton />
      </DialogContent>
    </Dialog>
  );
}
