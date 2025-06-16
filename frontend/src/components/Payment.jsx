import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Payment.css";
import PropTypes from "prop-types";

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Błąd dekodowania tokena:", e);
    return null;
  }
}

export default function Payment({ clearCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    homeAddress: "",
    phone: ""
  });

  useEffect(() => {
    if (!location.state?.cart || location.state.cart.length === 0) {
      navigate("/");
    }
  }, [location.state, navigate]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ).toFixed(2);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.homeAddress && formData.phone;
  };

  const handlePayment = () => {
    if (!isFormValid()) {
      alert("Uzupełnij wszystkie pola formularza.");
      return;
    }

    const token = sessionStorage.getItem("token");
    const userPayload = parseJwt(token);

    if (!userPayload) {
      alert("Błąd autoryzacji. Zaloguj się ponownie.");
      return;
    }

    const orderData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      homeAddress: formData.homeAddress,
      phone: formData.phone,
      cart: cart,
      total: parseFloat(totalPrice)
    };

    fetch(`${BACKEND_API_URL}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Zamówienie zostało złożone!");
        clearCart();
        navigate("/");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="payment-container">
      <h2>Formularz płatności</h2>
      <form className="payment-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="firstName"
          placeholder="Imię"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nazwisko"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="homeAddress"
          placeholder="Adres zamieszkania"
          value={formData.homeAddress}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefon"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </form>

      <div className="payment-summary">
        <p>Do zapłaty: <strong>{totalPrice} zł</strong></p>
        <button onClick={handlePayment} disabled={!isFormValid()}>
          Zapłać
        </button>
      </div>
    </div>
  );
}

Payment.propTypes = {
  clearCart: PropTypes.func.isRequired,
};
