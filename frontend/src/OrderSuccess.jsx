import React from 'react';
import './OrderSuccess.css';

/**
 * OrderSuccessModal
 *
 * Modal de confirmación que se muestra cuando una orden se crea exitosamente.
 * Proporciona feedback visual al usuario y permite continuar comprando
 * o navegar directamente al detalle de la orden creada.
 *
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {string} orderId - Identificador único de la orden creada.
 * @param {Function} onClose - Callback ejecutado al cerrar el modal
 * (click en overlay o botón secundario).
 * @param {Function} onViewOrder - Callback ejecutado al navegar al detalle
 * de la orden (acción principal).
 */

const OrderSuccessModal = ({ isOpen, orderId, onClose, onViewOrder }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        
        <div className="success-icon-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h2 className="modal-title">Order Created Successfully!</h2>
        
        <p className="modal-message">
          Your order has been placed and is being processed.
        </p>

        
        <div className="order-id-container">
          <span className="order-id-label">Order ID:</span>
          <span className="order-id-value">{orderId}</span>
        </div>

        <p className="email-note">
          You will receive a confirmation email shortly.
        </p>

        <div className="modal-actions">
          <button className="btn-modal btn-secondary" onClick={onClose}>
            Continue Shopping
          </button>
          
          <button className="btn-modal btn-primary" onClick={onViewOrder}>
            View Order
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessModal;