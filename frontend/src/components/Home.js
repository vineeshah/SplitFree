import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [one_expense, setone_expense] = useState([]);
  const [owed, setowed] = useState(0);
  const [owing, setowing] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/check_auth', { withCredentials: true });
        setIsAuthenticated(response.data.is_authenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/home', { withCredentials: true });
        setExpenses(response.data);
        const r2 = await axios.get('http://127.0.0.1:5000/getmoneyowed', { withCredentials: true });
        console.log('Money Owed Response:', r2.data);
        setowed(r2.data.total_money_owed_to_you || 0);
        setowing(r2.data.total_money_you_owe || 0);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchExpenses();
  }, []);

  const handleExpenseClick = (selectedExpenseId) => {
    try {
      const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId);
      if (selectedExpense) {
        setone_expense(selectedExpense);
      }
    } catch (error) {
      console.error('Error selecting expense:', error);
    }
  };

  const handleAddExpense = () => {
    if (isAuthenticated) {
      navigate('/add_expense');
    } else {
      alert('You need to log in to add an expense.');
    }
  };

  const handleUpdateExpense = (selectedExpense) => {
    if (isAuthenticated) {
      navigate('/add_expense', {
        state: {
          expense: selectedExpense,
          ower_id: selectedExpense.ower_id,
          selected_users: selectedExpense.users.map((user) => user.id),
        },
      });
    } else {
      alert('You need to log in to update an expense.');
    }
  };

  const handleDeleteExpense = async (selectedExpenseId) => {
    if (!isAuthenticated) {
      alert('You need to log in to delete an expense.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/expense/${selectedExpenseId}/delete`, { withCredentials: true });
        setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== selectedExpenseId));
        alert('Expense deleted successfully!');
        setone_expense(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <div
      className="container mt-4 p-4"
      style={{
        background: 'linear-gradient(to right,rgb(193, 205, 101),rgb(96, 193, 177))',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgb(0, 0, 0)',
      }}
    >
      <header className="text-center mb-4">
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#007bff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Home - Your Expenses
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            fontStyle: 'italic',
          }}
        >
          Track your expenses and manage your budget effectively.
        </p>
      </header>

      {/* Money Owed and Owing Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success">Money Owed to You</h5>
              <p className="card-text fs-4">${Number(owed || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-danger">Money You Owe</h5>
              <p className="card-text fs-4">${Number(owing || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <button
          className="btn btn-primary"
          onClick={handleAddExpense}
        >
          Add Expense
        </button>
        {!isAuthenticated && (
          <p className="mt-3">
            <Link to="/login" className="text-primary">Log in</Link> to add or manage expenses.
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <p className="text-center text-muted">No expenses found. Start adding your expenses!</p>
      ) : (
        <div className="row">
          {expenses.map((expense) => (
            <div key={expense.id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5
                    className="card-title text-primary cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleExpenseClick(expense.id)}
                  >
                    {expense.title}
                  </h5>
                  <p className="card-text">
                    <strong>Amount:</strong> ${expense.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Expense Modal */}
      {one_expense && one_expense.amount !== undefined && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{one_expense.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setone_expense(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Amount:</strong> ${one_expense.amount.toFixed(2)}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(one_expense.created_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Ower:</strong> {one_expense.ower || 'N/A'}
                </p>
                <p>
                  <strong>People Involved:</strong>
                </p>
                <ul>
                  {(one_expense.users || []).map((user, index) => (
                    <li key={index}>{user.name}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateExpense(one_expense)}
                >
                  Update
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteExpense(one_expense.id)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setone_expense(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;