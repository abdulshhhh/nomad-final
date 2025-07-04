// components/OAuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(parsedUser));
        navigate('/dashboard');
      } catch (err) {
        console.error('Error parsing OAuth user:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Signing you in with Google...</div>;
};

export default OAuthSuccess;
