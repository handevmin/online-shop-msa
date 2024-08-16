import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL;

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${PRODUCT_SERVICE_URL}/api/products`)
    .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Received data:", data); // 받은 데이터 로깅
        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }
        setProducts(data);
      })
      .catch(e => {
        console.error("Fetching products failed:", e);
        setError(e.message);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;