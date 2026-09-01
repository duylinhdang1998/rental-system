import { ComponentSection } from '@/features/ui-kit/components/ComponentSection';
import { UiKitHeader } from '@/features/ui-kit/components/UiKitHeader';
import { UiKitNavigation } from '@/features/ui-kit/components/UiKitNavigation';
import { UI_KIT_SECTIONS } from '@/features/ui-kit/lib/ui-kit-sections';

export function UiKitPage() {
  return (
    <div className="min-h-screen bg-app text-ink">
      <UiKitHeader />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:px-8">
        <UiKitNavigation />
        <main className="grid min-w-0 gap-12 lg:col-span-4">
          {UI_KIT_SECTIONS.map(({ component: Showcase, description, id, title }) => (
            <ComponentSection description={description} id={id} key={id} title={title}>
              <Showcase />
            </ComponentSection>
          ))}
        </main>
      </div>
    </div>
  );
}
