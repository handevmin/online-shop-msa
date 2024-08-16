import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Order from './components/Order';
import { API_URL } from './config';

const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.REACT_APP_ORDER_SERVICE_URL;
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL;

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const createOrder = () => {
    fetch(`${ORDER_SERVICE_URL}/api/orders`, {
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