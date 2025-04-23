import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/check_auth', { withCredentials: true })
      .then(response => {
        setIsAuthenticated(response.data.is_authenticated);
        if(response.data.is_authenticated){
            navigate('/home');}
      })
      .catch(error => {
        console.error('Auth check failed:', error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', formData, { withCredentials: true });
      if (response.data.success) {
        alert('Login successful!');
        navigate('/home');
        window.location.reload();
      } else {
        setError('Invalid credentials, please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Log In
        </button>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
      <p className="text-center mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
