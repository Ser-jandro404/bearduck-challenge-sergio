/**
 * OrderDetailsModal
 * -----------------
 * Displays detailed information for a single order.
 * Used for Challenge 02b (Order Detail View) and Challenge 05 (Order Status Management).
 *
 * Responsibilities:
 * - Show order metadata, items and totals
 * - Display color-coded status badges
 * - Allow valid order status transitions (admin/testing)
 * - Allow order cancellation (user flow)
 */
import React from 'react';
import './OrderDetailsModal.css';


const OrderDetailsModal = ({ isOpen, order, onClose, onCancelOrder, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  // Logic for formatting dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-EN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Maps order status to CSS classes for color-coded badges
  // Ensures visual consistency with defined status colors
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'successful': return 'status-successful'; 
      case 'cancelled': return 'status-cancelled';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  // User-side order cancellation
// Requires confirmation to prevent accidental irreversible actions
  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      onCancelOrder(order.id);
    }
  };

  /**
 * Renders workflow controls for order status transitions
 * (Admin / testing purpose)
 *
 * Valid transitions enforced by backend:
 * - pending → processing | cancelled
 * - processing → successful | failed | cancelled
 * - terminal states cannot change
 */
  const renderWorkflowButtons = () => {
    const s = order.status;
    
    // Online styles to differentiate this sandbox
    const adminStyle = {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      border: '1px dashed #cbd5e1',
      borderRadius: '8px'
    };
    // Terminal states do not allow further transitions
    if (['successful', 'cancelled', 'failed'].includes(s)) return null;

    return (
      <div style={adminStyle}>
        <h4 style={{marginTop:0, fontSize:'0.9rem', color:'#64748b'}}>⚙️ Admin / Workflow Controls</h4>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            
            {/* From Pending it can go to Processing */}
            {s === 'pending' && (
              <button 
                className="btn-action" 
                style={{backgroundColor: '#3b82f6', color: 'white'}}
                onClick={() => onUpdateStatus(order.id, 'processing')}
              >
                Mark as Processing
              </button>
            )}

            {/* From Processing you can go to Successful, Failed or Cancelled */}
            {s === 'processing' && (
              <>
                <button 
                  className="btn-action" 
                  style={{backgroundColor: '#10b981', color: 'white'}} // Verde
                  onClick={() => onUpdateStatus(order.id, 'successful')}
                >
                  Complete Order
                </button>
                
                <button 
                  className="btn-action" 
                  style={{backgroundColor: '#6b7280', color: 'white'}} // Gris
                  onClick={() => onUpdateStatus(order.id, 'failed')}
                >
                  Mark Failed
                </button>

                 <button 
                  className="btn-action" 
                  style={{backgroundColor: '#ef4444', color: 'white'}} // Rojo
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                >
                  Cancel (Admin)
                </button>
              </>
            )}
        </div>
      </div>
    );
  };
  // -----------------------------------------------------------------------

  // Visual calculations 
  const tax = order.total * 0.10; 
  const subtotal = order.total - tax;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="details-modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header-nav">
          <span className="back-link" onClick={onClose}>
              ← Back to Orders
          </span>
        </div>

        <div className="header-title-row">
          <div>
            <h2>Order Details</h2>
            <div className="order-id-sub">Order ID: {order.id.substring(0, 10)}...</div>
          </div>
          <span className={`status-badge ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <span className="info-label">Order Date</span>
            <span className="info-value">{formatDate(order.created_at)}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Total Items</span>
            <span className="info-value">
                {(() => {
                    const totalItems = order.items.reduce(
                    (acc, item) => acc + item.quantity,0)
                    return `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
                })()}
            </span>
          </div>
          <div className="info-card">
            <span className="info-label">Payment Status</span>
            <span className="info-value">Paid</span> 
          </div>
          <div className="info-card">
            <span className="info-label">Delivery Status</span>
            <span className="info-value">
                {order.status === 'pending' ? 'Waiting' : 
                 order.status === 'processing' ? 'Processing' :
                 order.status === 'successful' ? 'Delivered' : order.status}
            </span>
          </div>
        </div>

        <h3 className="items-section-title">Order Items</h3>
        <div className="items-container">
          {order.items.map((item, index) => (
            <div key={index} className="order-item-row">
              <div className="item-info">
                <div className="item-image-placeholder">
                   <img 
                     src="https://via.placeholder.com/50" 
                     alt="product" 
                     style={{width:'100%', height:'100%', borderRadius:'6px'}} 
                   />
                </div>
                <div className="item-details">
                  <h4>{item.product_name}</h4>
                  <p>Quantity: {item.quantity} x ${item.price}</p>
                </div>
              </div>
              <div className="item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="totals-section">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="total-row">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="total-row final">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Admin controlls */}
        {renderWorkflowButtons()}

        <div className="modal-footer">
          <button className="btn-outline">
            Download Invoice
          </button>
        
          {order.status === 'pending' ? (
             <button className="btn-action btn-danger" onClick={handleCancelClick}>        
                Cancel Order
             </button>
          ) : (
             <button className="btn-action">
               Track Order
             </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsModal;