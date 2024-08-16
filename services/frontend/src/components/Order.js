import React from 'react';

const Order = ({ cart, createOrder }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    createOrder();
  };

  return (
    <div>
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default Order;