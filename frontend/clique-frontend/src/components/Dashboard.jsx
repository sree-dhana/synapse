import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [message, setMessage] = useState('Loading...');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const role = new URLSearchParams(location.search).get('role');

  useEffect(() => {
    if (!token) {
      setError('No token found. Please login.');
      navigate('/login');
      return;
    }

    if (!role) {
      setError('No role specified.');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/mainpage/${role}Dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessage(res.data.message);
      } catch (err) {
        setError('Access Denied or Error');
        console.log(err);
      }
    };
    fetchData();
  }, [role, token, navigate]);

  return (
    <div>
      <h2>{error ? error : message}</h2>
    </div>
  );
}

export default Dashboard;
