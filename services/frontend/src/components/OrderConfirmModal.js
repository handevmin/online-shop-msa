import React from 'react';
import './OrderConfirmModal.css';

const OrderConfirmModal = ({ order, onClose }) => {
  if (!order) return null;

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Order Confirmation</h2>
        <p>Order ID: {order.id}</p>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price} x {item.quantity}
            </li>
          ))}
        </ul>
        <p className="total">Total: ${total.toFixed(2)}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default OrderConfirmModal;