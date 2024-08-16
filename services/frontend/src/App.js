import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Order from './components/Order';

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const createOrder = () => {
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cart }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Order created:', data);
        setCart([]);
      })
      .catch(error => {
        console.error('Error creating order:', error);
      });
  };

  return (
    <div className="App">
      <h1>Online Shop MSA</h1>
      <ProductList addToCart={addToCart} />
      <Cart cart={cart} removeFromCart={removeFromCart} />
      <Order cart={cart} createOrder={createOrder} />
    </div>
  );
}

export default App;