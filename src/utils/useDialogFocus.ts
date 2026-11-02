import { useEffect, useRef, type KeyboardEvent } from "react";

type UseDialogFocusOptions = {
  onEscape?: () => void;
  initialFocusSelector?: string;
};

const SELETOR_FOCAVEL = "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

export function useDialogFocus<T extends HTMLElement = HTMLElement>({
  onEscape,
  initialFocusSelector = SELETOR_FOCAVEL,
}: UseDialogFocusOptions = {}) {
  const dialogRef = useRef<T>(null);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>(initialFocusSelector)?.focus();

    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, [initialFocusSelector]);

  function onKeyDown(event: KeyboardEvent<T>) {
    if (event.key === "Escape" && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL);
    if (!focusable?.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return { dialogRef, onKeyDown };
}
