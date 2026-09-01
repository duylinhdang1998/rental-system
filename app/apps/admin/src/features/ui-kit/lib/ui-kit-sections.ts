import type { ComponentType } from 'react';
import { ButtonShowcase } from '@/features/ui-kit/components/ButtonShowcase';
import { DataDisplayShowcase } from '@/features/ui-kit/components/DataDisplayShowcase';
import { FeedbackShowcase } from '@/features/ui-kit/components/FeedbackShowcase';
import { FieldShowcase } from '@/features/ui-kit/components/FieldShowcase';
import { FoundationShowcase } from '@/features/ui-kit/components/FoundationShowcase';
import { OverlayShowcase } from '@/features/ui-kit/components/OverlayShowcase';
import { SelectionShowcase } from '@/features/ui-kit/components/SelectionShowcase';

interface UiKitSection {
  component: ComponentType;
  description: string;
  id: string;
  title: string;
}

export const UI_KIT_SECTIONS: readonly UiKitSection[] = [
  {
    component: FoundationShowcase,
    description: 'Màu ngữ nghĩa, kiểu chữ và nhịp điệu thị giác.',
    id: 'tokens',
    title: 'Nền tảng',
  },
  {
    component: ButtonShowcase,
    description: 'Thứ bậc hành động, kích thước và trạng thái xử lý.',
    id: 'buttons',
    title: 'Buttons',
  },
  {
    component: FieldShowcase,
    description: 'Trạng thái mặc định, có dữ liệu, khóa và lỗi.',
    id: 'fields',
    title: 'Fields',
  },
  {
    component: SelectionShowcase,
    description: 'Select, checkbox và radio dùng Radix primitives.',
    id: 'selection',
    title: 'Selection',
  },
  {
    component: DataDisplayShowcase,
    description: 'Badge, KPI, bảng dữ liệu và CreatedAt.',
    id: 'data-display',
    title: 'Data display',
  },
  {
    component: FeedbackShowcase,
    description: 'Trạng thái tải, rỗng và lỗi dùng chung.',
    id: 'feedback',
    title: 'Feedback',
  },
  {
    component: OverlayShowcase,
    description: 'Dialog có focus trap và điều khiển bằng bàn phím.',
    id: 'overlay',
    title: 'Overlay',
  },
];
