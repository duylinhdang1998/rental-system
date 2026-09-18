import { DamageCatalogHeader } from '@/features/settings/components/damage/DamageCatalogHeader';
import { DamageItemDialog } from '@/features/settings/components/damage/DamageItemDialog';
import { DamageItemList } from '@/features/settings/components/damage/DamageItemList';
import { SettingsTabs } from '@/features/settings/components/SettingsTabs';
import { useDamageCatalogPage } from '@/features/settings/hooks/use-damage-catalog-page';
import { ViewState } from '@/shared/ui/ViewState';

export function DamageItemsPage() {
  const page = useDamageCatalogPage();
  return (
    <section className="grid max-w-4xl gap-5">
      <SettingsTabs />
      <DamageCatalogHeader
        onCreate={page.openCreate}
        onShowInactiveChange={page.setShowInactive}
        showInactive={page.showInactive}
      />
      {page.items.isPending ? <ViewState heading="section" state="loading" /> : null}
      {page.items.isError ? (
        <ViewState heading="section" onRetry={() => void page.items.refetch()} state="error" />
      ) : null}
      {page.items.isSuccess ? (
        <DamageItemList
          busy={page.toggle.isPending}
          items={page.items.data.items}
          onEdit={page.openEdit}
          onToggle={page.toggleActive}
        />
      ) : null}
      {page.dialog?.kind === 'create' ? <DamageItemDialog onClose={page.close} /> : null}
      {page.dialog?.kind === 'edit' ? (
        <DamageItemDialog item={page.dialog.item} onClose={page.close} />
      ) : null}
    </section>
  );
}
