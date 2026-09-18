import { RETURN_PHOTO_CONTENT_TYPES, RETURN_PHOTO_LIMITS } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Field } from '@/components/ui/field';
import { FieldError } from '@/components/ui/field-error';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { photoIssue } from '@/features/contracts/lib/return-form';

interface ReturnPhotoFieldProps {
  onChange: (photos: File[]) => void;
  photos: File[];
}

const ISSUE_KEYS = { tooLarge: 'returnPhotoTooLarge', tooMany: 'returnPhotoTooMany' } as const;

/** JPEG / PNG / WebP, at most 5 files of 2 MB; the API re-checks by magic bytes (NFR-02). */
export function ReturnPhotoField({ onChange, photos }: ReturnPhotoFieldProps) {
  const { t } = useTranslation();
  const issue = photoIssue(photos);
  const error = issue ? t(ISSUE_KEYS[issue]) : undefined;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="return-photos">
        {t('returnPhotos', { max: RETURN_PHOTO_LIMITS.maxFiles })}
      </FieldLabel>
      <Input
        accept={RETURN_PHOTO_CONTENT_TYPES.join(',')}
        aria-describedby={error ? 'return-photos-error' : 'return-photos-count'}
        aria-invalid={Boolean(error)}
        id="return-photos"
        multiple
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        type="file"
      />
      <p className="text-xs text-ink-muted" id="return-photos-count">
        {t('returnPhotosSelected', { count: photos.length })}
      </p>
      <FieldError id="return-photos-error">{error}</FieldError>
    </Field>
  );
}
