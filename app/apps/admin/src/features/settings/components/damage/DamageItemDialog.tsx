import type { DamageItem } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { DamageItemFields } from '@/features/settings/components/damage/DamageItemFields';
import {
  useCreateDamageItem,
  useUpdateDamageItem,
} from '@/features/settings/hooks/use-damage-catalog';
import { useDamageItemForm } from '@/features/settings/hooks/use-damage-item-form';
import { damageItemBlocked } from '@/features/settings/lib/damage-catalog-presentation';

interface DamageItemDialogProps {
  item?: DamageItem;
  onClose: () => void;
}

const CREATE_COPY_KEYS = {
  description: 'damageItemDialogBody',
  save: 'damageItemSave',
  title: 'damageItemDialogCreateTitle',
};
const EDIT_COPY_KEYS = {
  description: 'damageItemDialogBody',
  save: 'damageItemSave',
  title: 'damageItemDialogEditTitle',
};

export function DamageItemDialog({ item, onClose }: DamageItemDialogProps) {
  const createMutation = useCreateDamageItem();
  const updateMutation = useUpdateDamageItem();
  const form = useDamageItemForm(item, createMutation, updateMutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={item ? EDIT_COPY_KEYS : CREATE_COPY_KEYS}
      mutation={form.mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={damageItemBlocked(form.form)}
    >
      <div data-damage-item-dialog>
        <DamageItemFields form={form} isEdit={Boolean(item)} />
      </div>
    </LifecycleFormDialog>
  );
}
