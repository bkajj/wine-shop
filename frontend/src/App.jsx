import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Products from './components/Products';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken && !token) {
      setToken(storedToken);
    }
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      sessionStorage.setItem('token', urlToken);
      setToken(urlToken);
      navigate('/', { replace: true });
    }
  }, [location]);

  const addToCart = (product) => {
    const productIndex = cart.findIndex(item => item.product.id === product.id);
    if (productIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[productIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const clearCart = () => setCart([]);

  const handleLogin = (token) => {
    setToken(token);
    sessionStorage.setItem('token', token);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          {!token ? (
            <>
              <Link to="/login">Logowanie</Link>
              <Link to="/register">Rejestracja</Link>
            </>
          ) : (
            <>
              <Link to="/">Produkty</Link>
              <Link to="/cart">Koszyk ({cart.length})</Link>
            </>
          )}
        </div>
        {token && (
          <div className="nav-right">
            <button className="nav-button" onClick={() => {
              setToken(null);
              sessionStorage.removeItem('token');
            }}>
              Wyloguj
            </button>
          </div>
        )}
      </nav>

      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
            <Route path="/register" element={<Register onRegisterSuccess={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Products addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} clearCart={clearCart} />} />
            <Route path="/payment" element={<Payment cart={cart} clearCart={clearCart} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
