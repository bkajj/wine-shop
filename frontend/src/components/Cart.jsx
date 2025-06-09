import React from 'react';
import '../styles/Cart.css';
import { useNavigate } from 'react-router-dom'; 
import PropTypes from "prop-types";

const Cart = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate("/payment", { state: { cart } });
  };

  return (
    <div className="cart-container">
      <h1>Koszyk</h1>
      {cart.length === 0 ? (
        <p>Twój koszyk jest pusty</p>
      ) : (
        <div>
          <ul>
            {cart.map((item) => (
              <li key={item.product.id}>
                <div className="product-info">
                  <span className="product-name">{item.product.name}</span>
                  <span className="product-quantity">Ilość: {item.quantity}</span>
                  <span className="product-price">{item.product.price} zł</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="total-panel">
            <div className="total-price">Łączna cena: {calculateTotal()} zł</div>
            <button className="order-button" onClick={handleCheckout} disabled={cart.length === 0}>Zamów</button>
          </div>
        </div>
      )}
    </div>
  );
};

Cart.propTypes = {
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
      }).isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  clearCart: PropTypes.func,
};

export default Cart;
