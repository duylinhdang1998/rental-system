import { Bike, CheckCircle2 } from 'lucide-react';

const BENEFITS = ['Theo dõi xe hôm nay', 'Kiểm soát hợp đồng', 'Đối soát rõ ràng'];

export function LoginHero() {
  return (
    <section className="hidden bg-brand-soft p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3 text-xl font-extrabold text-brand">
        <Bike aria-hidden /> MotoRental
      </div>
      <div className="max-w-lg">
        <p className="mb-5 text-4xl font-extrabold leading-tight text-ink">
          Mọi chuyến thuê,
          <br />
          gọn trong một nơi.
        </p>
        <ul className="grid gap-3 text-lg font-semibold text-ink-muted">
          {BENEFITS.map((item) => (
            <li className="flex items-center gap-3" key={item}>
              <CheckCircle2 aria-hidden className="text-positive" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm font-semibold text-ink-muted">Vận hành rõ ràng, phục vụ nhẹ nhàng.</p>
    </section>
  );
}
