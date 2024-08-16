import React from 'react';
import './Cart.css';

const Cart = ({ cart, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="Cart">
      <h2>Cart <span className="cart-badge">{itemCount}</span></h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - ${item.price} x {item.quantity}
                <button onClick={() => removeFromCart(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <p className="total">Total: ${total.toFixed(2)}</p>
        </>
      )}
    </div>
  );
};

export default Cart;