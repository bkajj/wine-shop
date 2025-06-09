import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const clearCart = () => setCart([]);
  const cartValue = useMemo(() => ({ cart, addToCart, clearCart }), [cart]);

  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};