import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './components/Home';
import About from './components/About';
import Register from './components/Register';
import Account from './components/Account';
import Login from './components/Login';
import Friends from './components/Friends';
import Groups from './components/Groups';
import Expense from './components/Add_Expense';
import Inbox from './components/inbox';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'; 



const App = () => {
  return ( 
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add_expense" element={<Expense />} />
        </Routes>
      </div>
    </Router>
    
    
  );
};

export default App;
