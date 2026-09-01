import { useTranslation } from 'react-i18next';

interface VehicleCardMetadataProps {
  createdAt: string;
  model: string;
  typeCode: string;
}

export function VehicleCardMetadata(props: VehicleCardMetadataProps) {
  const { t } = useTranslation();
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-ink-muted">{t('vehicleType')}</dt>
        <dd className="font-bold text-ink">{props.typeCode}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('vehicleModel')}</dt>
        <dd className="font-bold text-ink">{props.model}</dd>
      </div>
      <div className="col-span-2">
        <dt className="text-ink-muted">{t('createdAt')}</dt>
        <dd className="font-bold text-ink">{props.createdAt}</dd>
      </div>
    </dl>
  );
}
