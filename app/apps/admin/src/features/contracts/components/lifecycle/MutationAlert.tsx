interface MutationAlertProps {
  error: Error | null;
}

export function MutationAlert({ error }: MutationAlertProps) {
  if (!error) return null;
  return (
    <p className="rounded-control bg-negative-soft p-3 font-semibold text-negative" role="alert">
      {error.message}
    </p>
  );
}
