export const returnTranslations = {
  en: {
    returnQueueDeposit: 'Deposit {{amount}}',
    returnQueueDue: 'Due {{time}}',
    returnQueueEmptyBody:
      'Every vehicle is back at the store. Contracts appear here once they are handed over.',
    returnQueueEmptyTitle: 'No vehicles out',
    returnQueueLater: 'Due later',
    returnQueueLineKind: {
      DUE_TODAY: 'Due today',
      LATER: 'Due later',
      OVERDUE: '{{hours}} hours late',
    },
    returnQueueRenting: 'Renting contracts',
    returnQueueSubtitle: 'Vehicles still out, most urgent first: overdue, then due today.',
    returnQueueUpdated: 'Updated {{time}}',
    returnQueueVehicles: '{{returned}}/{{total}} vehicles received',
    returnQueueVehiclesOut: '{{count}} vehicles out',
  },
  vi: {
    returnQueueDeposit: 'Cọc {{amount}}',
    returnQueueDue: 'Hạn trả {{time}}',
    returnQueueEmptyBody:
      'Mọi xe đã về cửa hàng. Hợp đồng sẽ xuất hiện ở đây sau khi bàn giao xe cho khách.',
    returnQueueEmptyTitle: 'Không có xe nào đang ở ngoài',
    returnQueueLater: 'Chưa đến hạn',
    returnQueueLineKind: {
      DUE_TODAY: 'Đến hạn hôm nay',
      LATER: 'Chưa đến hạn',
      OVERDUE: 'Trễ {{hours}} giờ',
    },
    returnQueueRenting: 'Hợp đồng đang thuê',
    returnQueueSubtitle: 'Xe đang ở ngoài, xếp theo mức khẩn: quá hạn trước, đến hạn hôm nay sau.',
    returnQueueUpdated: 'Cập nhật {{time}}',
    returnQueueVehicles: 'Đã nhận {{returned}}/{{total}} xe',
    returnQueueVehiclesOut: '{{count}} xe đang ở ngoài',
  },
} as const;
