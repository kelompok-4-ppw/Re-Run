import { useEffect } from 'react';

export default function DeleteProductModal({ product, isDeleting = false, onCancel, onConfirm }) {
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isDeleting, onCancel]);

  if (!product) return null;

  return (
    <div
      className="prod-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-modal-title"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <div className="prod-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="prod-delete-icon-badge" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round" />
            <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round" />
          </svg>
        </div>

        <h3 id="delete-product-modal-title" className="prod-modal-title">
          Delete this product?
        </h3>

        <p className="prod-modal-desc">
          {product.name} will be removed from the catalog and inventory. This action cannot be undone.
        </p>

        <div className="prod-modal-actions">
          <button
            type="button"
            className="prod-modal-cancel"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="prod-modal-danger"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}