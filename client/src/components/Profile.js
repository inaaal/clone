import React, { useState, useEffect } from 'react';
import { profile } from '../api';

function Profile({ user, onUpdate, onBack }) {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState('');

  // ===== ВАЛИДАЦИЯ USERNAME =====
  const validateUsername = (value) => {
    // Только буквы, цифры и подчёркивание
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Only letters, numbers and underscore';
    }
    if (value.length < 3) {
      return 'Minimum 3 characters';
    }
    return null;
  };

  // ===== ПРОВЕРКА USERNAME =====
  useEffect(() => {
    const checkUsername = async () => {
      const trimmedUsername = username.trim();
      
      // Если username не изменился или пустой
      if (!trimmedUsername || trimmedUsername === user.username) {
        setUsernameAvailable(null);
        setUsernameError('');
        return;
      }

      // Валидация на клиенте
      const validationError = validateUsername(trimmedUsername);
      if (validationError) {
        setUsernameError(validationError);
        setUsernameAvailable(false);
        return;
      }

      setIsChecking(true);
      try {
        const res = await fetch('http://localhost:5000/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: trimmedUsername })
        });
        const data = await res.json();
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameError('');
        } else {
          setUsernameAvailable(false);
          setUsernameError(data.error || 'Username already taken');
        }
      } catch (e) {
        console.error('Check username error', e);
        setUsernameError('Error checking username');
        setUsernameAvailable(false);
      }
      setIsChecking(false);
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username, user.username]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await profile.uploadAvatar(file);
      if (res.data.success) {
        onUpdate({ ...user, avatar: res.data.avatar });
        setSuccess('Avatar updated!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError('Error uploading avatar');
    }
    setLoading(false);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setError('Enter your name');
      return;
    }

    // Проверяем username перед отправкой
    if (trimmedUsername && trimmedUsername !== user.username) {
      if (!usernameAvailable) {
        setError('Username is not available');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await profile.update({ 
        name: trimmedName, 
        bio: bio,
        username: trimmedUsername
      });
      if (res.data.success) {
        onUpdate(res.data.user);
        setSuccess('Profile updated!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error updating profile');
    }
    setLoading(false);
  };

  const isUsernameValid = () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed === user.username) return true;
    return usernameAvailable === true;
  };

  const canSave = !loading && isUsernameValid() && name.trim();

  return (
    <div className="profile-container">
      <button onClick={onBack} className="back-btn-main">← Back</button>
      
      <div className="profile-card">
        <h2>Profile</h2>
        
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={`http://localhost:5000/uploads/avatars/${user.avatar}`} alt="Avatar" />
            ) : (
              user.name?.[0] || '?'
            )}
          </div>
          <label className="avatar-upload-btn">
            Upload photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
        </div>

        <div className="profile-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="profile-field">
          <label>Username</label>
          <div className="username-input-wrapper">
            <span className="username-prefix">@</span>
            <input
              type="text"
              className="username-input"
              value={username}
              onChange={handleUsernameChange}
              placeholder="username"
            />
            {isChecking && <span className="username-checking">...</span>}
            {usernameAvailable === true && username !== user.username && (
              <span className="username-available">✓ Available</span>
            )}
            {usernameAvailable === false && username !== user.username && (
              <span className="username-taken">✗ {usernameError}</span>
            )}
            {username === user.username && username && (
              <span className="username-current">✓ Current</span>
            )}
          </div>
          <div className="field-hint">Only letters, numbers and underscore. Min 3 characters.</div>
        </div>

        <div className="profile-field">
          <label>Phone</label>
          <input type="text" value={user.phone} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="profile-field">
          <label>About</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell about yourself..."
            rows="3"
          />
        </div>

        <div className="profile-field">
          <label>Account type</label>
          <div className="user-type-badge">
            {user.user_type === 'client' && 'Client'}
            {user.user_type === 'worker' && 'Worker'}
            {user.user_type === 'admin' && 'Admin'}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button 
          onClick={handleSubmit} 
          className="save-btn" 
          disabled={!canSave}
        >
          {loading ? '...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default Profile;