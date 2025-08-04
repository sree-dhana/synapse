import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/mainpage/login', form);
      const token = res.data.accessToken;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('token', token);
      alert('Login successful');
      if (decoded.user.role === 'student') {
        navigate('/dashboard?role=student');
      } else {
        navigate('/dashboard?role=teacher');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        placeholder='Email'
        type='email'
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder='Password'
        type='password'
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type='submit'>Login</button>
    </form>
  );
}

export default Login;