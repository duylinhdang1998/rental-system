import { useTranslation } from 'react-i18next';
import { useReturnPhotos } from '@/features/contracts/hooks/use-return-photos';

interface ReturnPhotoGalleryProps {
  count: number;
  lineId: string;
}

/** Thumbnails come through short-lived signed links; an expired link shows the alt text. */
export function ReturnPhotoGallery({ count, lineId }: ReturnPhotoGalleryProps) {
  const { t } = useTranslation();
  const photos = useReturnPhotos(lineId, count > 0);
  if (count === 0) return null;
  return (
    <div className="grid gap-2" data-return-photos={count}>
      <p className="text-ink">{t('returnPhotoCount', { count })}</p>
      <ul className="flex flex-wrap gap-2">
        {(photos.data?.items ?? []).map((photo) => (
          <li key={photo.index}>
            <img
              alt={t('returnPhotoAlt')}
              className="size-20 rounded-control border border-line object-cover"
              loading="lazy"
              src={photo.url}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
