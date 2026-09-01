export function focusDialogPrimaryField(event: Event) {
  event.preventDefault();
  if (!(event.currentTarget instanceof HTMLElement)) return;
  event.currentTarget.querySelector<HTMLElement>('[data-dialog-autofocus]')?.focus();
}
