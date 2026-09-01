import { TextAreaField } from '@/shared/ui/TextAreaField';
import { TextField } from '@/shared/ui/TextField';

export function FieldShowcase() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TextField id="field-empty" label="Tên khách hàng" placeholder="Nhập họ và tên" />
      <TextField defaultValue="Nguyễn Văn An" id="field-filled" label="Đã có dữ liệu" />
      <TextField disabled id="field-disabled" label="Không thể chỉnh sửa" value="Dữ liệu khóa" />
      <TextField
        defaultValue="090"
        error="Số điện thoại chưa đủ 10 chữ số"
        id="field-error"
        label="Trạng thái lỗi"
      />
      <div className="md:col-span-2">
        <TextAreaField
          id="field-note"
          label="Ghi chú"
          placeholder="Thông tin cần lưu ý khi bàn giao xe"
          rows={4}
        />
      </div>
    </div>
  );
}
