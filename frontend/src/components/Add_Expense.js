import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Expense = () => {
  const [formData, setFormData] = useState({
    expense: '',
    amount: 0,
    user_list: [],
    selected_users: [],
    ower_id: 0, 
  });
  const [searchQueryWhoPaid, setSearchQueryWhoPaid] = useState('');
  const [searchQueryInvolved, setSearchQueryInvolved] = useState(''); 
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state && location.state.expense) {
      const { expense, ower_id, selected_users } = location.state; 

      // const owerUserId = ower_id || formData.user_list.find((user) => user.name === expense.ower)?.id || 0;

      setFormData({
        expense: expense.title,
        amount: expense.amount,
        user_list: [],
        selected_users: expense.users.map((user) => user.id) || [],
        ower_id: expense.ower_id || 0, // Pre-fill "Who Paid" if updating
      });
    }
  }, [location.state]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:5000/show_users', { withCredentials: true })
      .then((response) => {
        setFormData((prev) => ({
          ...prev,
          user_list: response.data,
        }));
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleSelection = (selectedUserId) => {
    setFormData((prev) => ({
      ...prev,
      selected_users: prev.selected_users.includes(selectedUserId)
        ? prev.selected_users.filter((id) => id !== selectedUserId)
        : [...prev.selected_users, selectedUserId],
    }));
  };

  const handleWhoPaidChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      ower_id: userId, // Update the ower_id field
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expenseData = {
      expense: formData.expense,
      amount: formData.amount,
      selected_users: formData.selected_users,
      ower_id: formData.ower_id, // Include "Who Paid" in the submission
    };

    try {
      if (location.state && location.state.expense) {
        // Update existing expense
        const response = await axios.post(
          `http://127.0.0.1:5000/expense/${location.state.expense.id}/update`,
          expenseData,
          { withCredentials: true }
        );
        if (response.data.success) {
          alert('Expense Updated!');
          navigate('/home');
        }
      } else {
        const response = await axios.post('http://127.0.0.1:5000/expense', expenseData, { withCredentials: true });
        if (response.data.success) {
          alert('Expense Added!');
          navigate('/home');
          window.location.reload();
        } else {
          setError('Invalid credentials, please try again.');
        }
      }
    } catch (error) {
      setError('Submission failed. Please try again.');
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg">
      <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-6">
        {location.state && location.state.expense ? 'Update Expense' : 'Add Expense'}
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expense Name */}
        <div>
          <label className="block text-lg font-medium text-blue-700 mb-2">Expense Name</label>
          <input
            type="text"
            name="expense"
            value={formData.expense}
            onChange={handleChange}
            placeholder="Enter expense name"
            className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-lg font-medium text-blue-700 mb-2">Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

      {/* Who Paid */}
      <div>
      <label className="block text-lg font-medium text-blue-700 mb-2">Who Paid</label>
      <input
        type="text"
        placeholder="Search user"
        value={
          formData.ower_id
            ? formData.user_list.find((user) => user.id === formData.ower_id)?.name || ''
            : searchQueryWhoPaid
        }
        onChange={(e) => setSearchQueryWhoPaid(e.target.value)}
        className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
      />
      <div className="max-h-40 overflow-y-auto border border-blue-300 rounded-lg shadow-sm">
        {formData.user_list
          .filter((user) => user.name.toLowerCase().includes(searchQueryWhoPaid.toLowerCase()))
          .map((user) => (
            <div
              key={user.id}
              className={`p-2 cursor-pointer hover:bg-blue-100 ${
                formData.ower_id === user.id ? 'bg-blue-200' : ''
              }`}
              onClick={() => handleWhoPaidChange(user.id)}
            >
              {user.name}
              {formData.ower_id === user.id && (
                <span className="text-green-600 font-bold ml-2">✓</span>
              )}
            </div>
          ))}
      </div>
      </div>

      {/* Who's Involved */}
      <div>
      <label className="block text-lg font-medium text-blue-700 mb-2">Who's Involved</label>
      <input
        type="text"
        placeholder="Search user"
        value={formData.selected_users
          .map((id) => formData.user_list.find((user) => user.id === id)?.name)
          .filter(Boolean)
          .join(', ')}
        onChange={(e) => setSearchQueryInvolved(e.target.value)}
        className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        readOnly
      />
      <div className="max-h-40 overflow-y-auto border border-blue-300 rounded-lg shadow-sm">
        {formData.user_list
          .filter((user) => user.name.toLowerCase().includes(searchQueryInvolved.toLowerCase()))
          .map((user) => (
            <div
              key={user.id}
              className={`p-2 cursor-pointer hover:bg-blue-100 ${
                formData.selected_users.includes(user.id) ? 'bg-blue-200' : ''
              }`}
              onClick={() => handleSelection(user.id)}
            >
              {user.name}
              {formData.selected_users.includes(user.id) && (
                <span className="text-green-600 font-bold ml-2">✓</span>
              )}
            </div>
          ))}
      </div>
      </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
        >
          {location.state && location.state.expense ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default Expense;