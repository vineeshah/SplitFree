import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Friends = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // State to store friends
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState(''); // State for current user's name
  const [currentUserId, setCurrentUserId] = useState(null); // State for current user's ID
  const [allUsers, setAllUsers] = useState([]); // State to store all users

  // Fetch current user's name, all users, and friends on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch current user's name and ID
        const userResponse = await axios.get('http://127.0.0.1:5000/account', { withCredentials: true });
        setCurrentUserName(userResponse.data.username || '');
        setCurrentUserId(userResponse.data.id || null);

        // Fetch all users
        const usersResponse = await axios.get('http://127.0.0.1:5000/show_users', { withCredentials: true });
        setAllUsers(usersResponse.data || []);

        // Fetch friends
        const friendsResponse = await axios.get('http://127.0.0.1:5000/friends', { withCredentials: true });
        const filteredFriends = friendsResponse.data.filter((friend) => friend.id !== userResponse.data.id); // Exclude current user
        setFriends(filteredFriends);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setError('Failed to load data. Please try again.');
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Filter users based on the search term (case-insensitive) and exclude the current user
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== currentUserId
    );

    if (filteredUsers.length > 0) {
      setSearchResults(filteredUsers);
    } else {
      setSearchResults([]);
      setError('No users found. Please try again.');
    }
  };

  const sendFriendRequest = async (userId) => {
    const message = `${currentUserName} has sent you a friend request on Splitwise(lite). Accept to start sharing expenses!`;

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/send_notification',
        { recipient_id: userId, message: message },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccessMessage('Friend request sent successfully!');
      }
    } catch (error) {
      setError('Failed to send friend request. Please try again.');
      console.error('Friend request error:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-primary">Friends</h1>
      <p className="text-center text-muted">Manage your friends and track shared expenses.</p>

      {/* Friends List */}
      <div className="mt-4">
        <h2 className="text-secondary">Your Friends</h2>
        {friends.length > 0 ? (
          <ul className="list-group">
            {friends.map((friend) => (
              <li key={friend.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img
                    src={`http://127.0.0.1:5000/static/profile_pics/${friend.image_file}`}
                    alt={friend.name}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px' }}
                  />
                  <div>
                    <p className="mb-0">{friend.name}</p>
                    <small className="text-muted">{friend.email}</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted">You have no friends yet.</p>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="d-flex justify-content-center mt-4">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary ms-2">
          Search
        </button>
      </form>

      {/* Error or Success Messages */}
      {error && <p className="text-danger text-center mt-3">{error}</p>}
      {successMessage && <p className="text-success text-center mt-3">{successMessage}</p>}

      {/* Search Results */}
      <div className="mt-4">
        <h2 className="text-secondary">Search Results</h2>
        {searchResults.length > 0 ? (
          <ul className="list-group">
            {searchResults.map((user) => (
              <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{user.name}</span>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => sendFriendRequest(user.id)}
                >
                  Send Friend Request
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted">No users found. Try searching for someone!</p>
        )}
      </div>
    </div>
  );
};

export default Friends;