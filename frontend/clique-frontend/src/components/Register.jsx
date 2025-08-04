import { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/mainpage/register', form);
      alert('User registered successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        placeholder='Username'
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
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
      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value=''>Select Role</option>
        <option value='student'>Student</option>
        <option value='teacher'>Teacher</option>
      </select>
      <button type='submit'>Register</button>
    </form>
  );
}

export default Register;