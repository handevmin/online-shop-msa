import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Order from './components/Order';
import Login from './components/Login';
import OrderConfirmModal from './components/OrderConfirmModal';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      if (newCart[index].quantity > 1) {
        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 };
      } else {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const createOrder = () => {
    if (!user) {
      alert('Please login to place an order.');
      return;
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id, items: cart }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Order created:', data);
        setConfirmOrder({ id: data.id, items: cart });
        setCart([]);
      })
      .catch(error => {
        console.error('Error creating order:', error);
        alert('Failed to place order. Please try again.');
      });
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Shop MSA</h1>
        {user ? (
          <div className="user-info">
            Welcome, {user.email}!
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </header>
      <main className="App-main">
        <ProductList addToCart={addToCart} />
        <div className="App-sidebar">
          <Cart cart={cart} removeFromCart={removeFromCart} />
          <Order cart={cart} createOrder={createOrder} user={user} />
        </div>
      </main>
      <OrderConfirmModal
        order={confirmOrder}
        onClose={() => setConfirmOrder(null)}
      />
    </div>
  );
}

export default App;