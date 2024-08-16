import React from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose, addToCart }) => {
  if (!product) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{product.name}</h2>
        <p>Price: ${product.price}</p>
        <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ProductModal;