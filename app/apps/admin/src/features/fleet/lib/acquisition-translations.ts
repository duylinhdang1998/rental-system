export const acquisitionTranslations = {
  en: {
    acquisitionAction: 'Cost basis',
    acquisitionBody:
      'Purchase price and straight-line depreciation feed the fleet economics report. Owner only.',
    acquisitionIssue: {
      incomplete: 'Enter the price, the purchase day and a useful life from 1 to 240 months.',
      salvage: 'The salvage value cannot exceed the purchase price.',
    },
    acquisitionLife: 'Useful life (months)',
    acquisitionLoading: 'Loading cost basis',
    acquisitionPreview: {
      accumulated: 'Accumulated depreciation',
      bookValue: 'Book value today',
      monthly: 'Depreciation per month',
      months: 'Months elapsed',
    },
    acquisitionPreviewTitle: 'Depreciation preview',
    acquisitionPrice: 'Purchase price (VND)',
    acquisitionPurchasedOn: 'Purchased on',
    acquisitionSalvage: 'Salvage value (VND)',
    acquisitionSave: 'Save cost basis',
    acquisitionTitle: 'Cost basis for {{code}}',
  },
  vi: {
    acquisitionAction: 'Giá vốn',
    acquisitionBody:
      'Giá mua và khấu hao đường thẳng được dùng cho báo cáo hiệu quả đội xe. Chỉ Chủ cửa hàng.',
    acquisitionIssue: {
      incomplete: 'Nhập giá mua, ngày mua và thời gian khấu hao từ 1 đến 240 tháng.',
      salvage: 'Giá trị thanh lý không được vượt giá mua.',
    },
    acquisitionLife: 'Thời gian khấu hao (tháng)',
    acquisitionLoading: 'Đang tải giá vốn',
    acquisitionPreview: {
      accumulated: 'Khấu hao lũy kế',
      bookValue: 'Giá trị còn lại hôm nay',
      monthly: 'Khấu hao mỗi tháng',
      months: 'Số tháng đã khấu hao',
    },
    acquisitionPreviewTitle: 'Khấu hao dự kiến',
    acquisitionPrice: 'Giá mua (VNĐ)',
    acquisitionPurchasedOn: 'Ngày mua',
    acquisitionSalvage: 'Giá trị thanh lý (VNĐ)',
    acquisitionSave: 'Lưu giá vốn',
    acquisitionTitle: 'Giá vốn xe {{code}}',
  },
} as const;
