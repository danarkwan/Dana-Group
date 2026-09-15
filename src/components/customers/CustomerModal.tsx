'use client';

import { useState } from 'react';
import { Customer } from '@prisma/client';

type CustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  customer?: Customer;
  translations: {
    addCustomer: string;
    edit: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    save: string;
    cancel: string;
  };
};

export default function CustomerModal({
  isOpen,
  onClose,
  onSave,
  customer,
  translations
}: CustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await onSave(formData);
    setIsLoading(false);
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="modalTitle">
          {customer ? translations.edit : translations.addCustomer}
        </h2>

        <form onSubmit={handleSubmit} className="modalForm">
          <div className="formGroup">
            <label className="label" htmlFor="name">{translations.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input"
              defaultValue={customer?.name || ''}
              required
            />
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="phone">{translations.phone}</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="input"
              defaultValue={customer?.phone || ''}
            />
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="email">{translations.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              defaultValue={customer?.email || ''}
            />
          </div>

          <div className="formGroup">
            <label className="label" htmlFor="address">{translations.address}</label>
            <textarea
              id="address"
              name="address"
              className="input"
              defaultValue={customer?.address || ''}
              rows={3}
            />
          </div>

          <div className="modalActions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '...' : translations.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
