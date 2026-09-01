import { ButtonStates } from '@/features/ui-kit/components/ButtonStates';
import { ButtonVariants } from '@/features/ui-kit/components/ButtonVariants';

export function ButtonShowcase() {
  return (
    <div className="grid gap-7">
      <ButtonVariants />
      <ButtonStates />
    </div>
  );
}
