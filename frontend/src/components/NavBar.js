import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pfp, setPfp] = useState('https://ui-avatars.com/api/?name=User&size=30');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/check_auth', { withCredentials: true })
      .then(response => {
        setIsAuthenticated(response.data.is_authenticated);
        if (response.data.is_authenticated) {
          axios.get('http://127.0.0.1:5000/account', { withCredentials: true })
            .then(response => {
              const pictureUrl = response.data.picture
                ? `http://127.0.0.1:5000/${response.data.picture}`
                : 'https://ui-avatars.com/api/?name=User&size=30';
              setPfp(pictureUrl);
            });
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://127.0.0.1:5000/logout', { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Splitwise(lite)</Link>
        <div className="navbar-nav me-auto">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/about">About</Link>
          <Link className="nav-link" to="/friends">Friends</Link>
          <Link className="nav-link" to="/groups">Groups</Link>
        </div>
        <div className="navbar-nav ms-auto d-flex align-items-center">
          {isAuthenticated && (
            <Link className="nav-link position-relative me-3" to="/inbox">
              <i className="fas fa-inbox" style={{ fontSize: '1.5rem', color: 'white' }}></i>
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/add_expense">Add Expense</Link>
              <div className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={pfp}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: '30px', height: '30px' }}
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to="/account">Account</Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;