import React from 'react';
import './Order.css';

const Order = ({ cart, createOrder, user }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    createOrder();
  };

  return (
    <div className="Order">
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={cart.length === 0 || !user}>
          {user ? 'Place Order' : 'Login to Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Order;