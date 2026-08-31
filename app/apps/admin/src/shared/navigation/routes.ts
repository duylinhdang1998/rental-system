import type { UserRole } from '@rental/contracts';
import {
  ClipboardList,
  FileText,
  Gauge,
  RotateCcw,
  Settings,
  UserRound,
  Users,
  Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  icon: LucideIcon;
  key: string;
  ownerOnly?: boolean;
  path: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { icon: Gauge, key: 'dashboard', path: '/' },
  { icon: Warehouse, key: 'vehicles', path: '/vehicles' },
  { icon: Users, key: 'customers', path: '/customers' },
  { icon: FileText, key: 'contracts', path: '/contracts' },
  { icon: RotateCcw, key: 'returns', path: '/returns' },
  { icon: ClipboardList, key: 'reports', ownerOnly: true, path: '/reports' },
  { icon: UserRound, key: 'employees', ownerOnly: true, path: '/employees' },
  { icon: Settings, key: 'settings', ownerOnly: true, path: '/settings' },
];

export function navigationForRole(role: UserRole): NavigationItem[] {
  return NAVIGATION_ITEMS.filter((item) => role === 'OWNER' || !item.ownerOnly);
}
