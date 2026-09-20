'use client';

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  intent?: 'danger' | 'success';
};

export default function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText = 'پەشیمانبوونەوە',
  intent = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = intent === 'danger';
  const color = isDanger ? 'var(--danger-color, #dc2626)' : 'var(--color-success, #10b981)';
  const defaultConfirmText = isDanger ? 'سڕینەوە' : 'بەڵێ، دڵنیام';
  const finalConfirmText = confirmText || defaultConfirmText;

  return (
    <div className="modalOverlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h3 className="modalTitle" style={{ marginBottom: '1rem', color: color }}>
          دڵنیایت؟
        </h3>
        
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.5' }}>
          {message}
        </p>

        <div className="modalActions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{ backgroundColor: color, borderColor: color }}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
