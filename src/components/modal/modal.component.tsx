import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-gutter">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-outline bg-surface-lowest">
        <header className="flex items-center justify-between border-b border-outline px-6 py-4">
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-outline px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

export default Modal;
