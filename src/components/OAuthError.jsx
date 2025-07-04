import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuthError = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get('reason');

    if (reason === 'email_exists') {
      alert('This email is already registered. Please use login instead.');
      navigate('/login');
    }
  }, []);

  return null;
};

export default OAuthError;
