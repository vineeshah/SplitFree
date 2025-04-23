import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Button, TextField, Avatar, Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    height: '100vh',
  });
  
  const ProfilePic = styled(Avatar)({
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    marginBottom: '20px',
    objectFit: 'cover',  // This will ensure the image fills the circle without stretching
  });
  
  const Form = styled(Paper)({
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  });
  
  const InputField = styled(TextField)({
    marginBottom: '20px',
    '& input': {
      color: '#333',
    },
  });
  
  const SubmitButton = styled(Button)({
    backgroundColor: '#5e35b1',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#4a2c9e',
    },
  });
  
  const Header = styled(Typography)({
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
  });
  
  const InfoText = styled(Typography)({
    color: '#555',
    fontSize: '16px',
    marginBottom: '10px',
  });

const Account = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        picture: ''
    });
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);    

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/check_auth', { withCredentials: true })
          .then(response => {
            setIsAuthenticated(response.data.is_authenticated);
            if(response.data.is_authenticated){
                navigate('/account');
            }else{
                navigate('/login');
            }    
          })
          .catch(error => {
            console.error('Auth check failed:', error);
          });
      }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/account', { withCredentials: true })
            .then(response => {
                setFormData(response.data);
            })
            .catch(error => {
                if(error.response && error.response.status ==401){
                    navigate("/login");
                }
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleFileChange = (e) => {
        setFormData({ ...formData, picture: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('username', formData.username);
        formDataToSubmit.append('email', formData.email);

        // If a picture file is selected, append it to the FormData.
        if (formData.picture) {
            formDataToSubmit.append('picture', formData.picture);
        }

        try {
            await axios.post('http://127.0.0.1:5000/account', formDataToSubmit, { withCredentials: true });
            alert('Account updated successfully');
            window.location.reload();
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    

    return (
        <Container>
        <Form>
          <Header>Update Your Account</Header>
  
          {/* Profile Picture */}
          <ProfilePic
            alt="User's profile"
            src={`http://127.0.0.1:5000/${formData.picture}`}
          />
  
          <form onSubmit={handleSubmit}>
            <InputField
              label="Username"
              name="username"
              variant="outlined"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              required
            />
  
            <InputField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
  
            <input
              type="file"
              name="picture"
              onChange={handleFileChange}
              accept="image/*"
              style={{ marginBottom: '20px' }}
            />
  
            <SubmitButton
              type="submit"
              variant="contained"
              fullWidth
            >
              Update
            </SubmitButton>
          </form>
  
          <Box mt={2}>
            <InfoText>Currently logged in as: {formData.username}</InfoText>
            <InfoText>Email: {formData.email}</InfoText>
          </Box>
        </Form>
      </Container>
    );
    
};

export default Account;
