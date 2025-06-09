import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    
    if (token) {
      sessionStorage.setItem("access_token", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Logowanie...</p>;
};
