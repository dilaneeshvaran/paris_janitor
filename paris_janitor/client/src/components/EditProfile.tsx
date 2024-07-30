import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface EditProfileProps {
    userId: string;
    onClose: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userId, onClose }) => {
    const [user, setUser] = useState({ firstname: '', lastname: '', email: '' });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:3000/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                setError('Failed to load user data.');
            });
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const updatedUser = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        };

        // Log the request data
        console.log('Submitting user update:', updatedUser);

        axios.patch(`http://localhost:3000/users/${userId}`, updatedUser, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Response:', response);
                setSuccess('Profile updated successfully.');
                setError(null);
            })
            .catch(error => {
                console.error('Error updating profile:', error.response || error.message);
                setError(error.response?.data?.message || 'Failed to update profile.');
            });
    };

    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const token = localStorage.getItem('token');
        const updatedPassword = { password };

        // Log the password change request
        console.log('Submitting password update:', updatedPassword);

        axios.patch(`http://localhost:3000/users/${userId}`, updatedPassword, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Response:', response);
                setSuccess('Password updated successfully.');
                setError(null);
                setShowPasswordForm(false);
                setPassword('');
                setConfirmPassword('');
            })
            .catch(error => {
                console.error('Error updating password:', error.response || error.message);
                setError(error.response?.data?.message || 'Failed to update password.');
            });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>Close</button>
                <h2>Edit Profile</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <label>
                        First Name:
                        <input type="text" name="firstname" value={user.firstname} onChange={handleChange} />
                    </label>
                    <label>
                        Last Name:
                        <input type="text" name="lastname" value={user.lastname} onChange={handleChange} />
                    </label>
                    <label>
                        Email:
                        <input type="email" name="email" value={user.email} onChange={handleChange} />
                    </label>
                    <button type="submit">Save Changes</button>
                </form>
                <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
                {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit}>
                        <label>
                            New Password:
                            <input type="password" name="password" value={password} onChange={handlePasswordChange} />
                        </label>
                        <label>
                            Confirm New Password:
                            <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                        </label>
                        <button type="submit">Save New Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfile;
