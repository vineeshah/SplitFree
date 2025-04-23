import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your Flask backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example of a GET request to fetch expenses
export const getExpenses = async () => {
  try {
    const response = await api.get('/home'); // Replace with the correct endpoint for fetching expenses
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error; // Throw error to be handled elsewhere
  }
};

// Example of a POST request to add an expense
export const addExpense = async (expense) => {
  try {
    const response = await api.post('/expense', expense); // Replace with the correct endpoint for adding expenses
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error; // Throw error to be handled elsewhere
  }
};

// Example of a POST request for user login
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials); // Replace with the correct login endpoint
    return response.data; // Return response data (e.g., token or user data)
  } catch (error) {
    console.error('Error logging in:', error);
    throw error; // Throw error to be handled elsewhere
  }
};

// Example of a POST request for user registration
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData); // Replace with the correct register endpoint
    return response.data; // Return response data (e.g., confirmation message)
  } catch (error) {
    console.error('Error registering:', error);
    throw error; // Throw error to be handled elsewhere
  }
};

export default api;
