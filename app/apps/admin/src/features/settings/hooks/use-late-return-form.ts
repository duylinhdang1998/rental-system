import { useState, type FormEvent } from 'react';
import type { PricingVersion } from '@rental/contracts';
import { usePublishPricing } from '../hooks/use-pricing-settings';

export function useLateReturnForm(pricing: PricingVersion) {
  const publish = usePublishPricing();
  const [graceMinutes, setGraceMinutes] = useState(pricing.lateReturnPolicy.graceMinutes);
  const [hourlyRateVnd, setHourlyRateVnd] = useState(pricing.lateReturnPolicy.hourlyRateVnd);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    publish.mutate({
      lateReturnPolicy: { graceMinutes, hourlyRateVnd },
      tiers: pricing.tiers,
      typeCode: pricing.typeCode,
    });
  };
  return {
    example: { graceMinutes, hourlyRateVnd: hourlyRateVnd.toLocaleString('vi-VN') },
    graceMinutes,
    hourlyRateVnd,
    publish,
    setGraceMinutes,
    setHourlyRateVnd,
    submit,
  };
}

export type LateReturnForm = ReturnType<typeof useLateReturnForm>;
