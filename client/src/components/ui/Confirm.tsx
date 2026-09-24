import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function Confirm({
  open,
  title,
  message,
  confirmLabel = "O'chirish",
  loading,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width={420}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="shrink-0 h-9 w-9 grid place-items-center rounded-full bg-critical/12 text-critical">
          <AlertTriangle size={17} />
        </span>
        <p className="text-[var(--ink-2)] leading-relaxed pt-1.5">{message}</p>
      </div>
    </Modal>
  );
}
