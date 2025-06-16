import React, { useEffect, useState } from "react";
import "../styles/Products.css";
import PropTypes from "prop-types";

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function Products({ addToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="products-container">
      <h2>Nasze Wina</h2>
      <div className="products-list">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.price} zł</p>
            <button onClick={() => addToCart(p)}>Dodaj do koszyka</button>
          </div>
        ))}
      </div>
    </div>
  );
}

Products.propTypes = {
  addToCart: PropTypes.func.isRequired,
};