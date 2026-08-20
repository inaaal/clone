import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import { auth } from './api';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    auth.me()
      .then(res => {
        setUser(res.data.user);
        socket.emit('user-online', res.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    socket.on('new-message', (message) => {
      setChats(prev => {
        const existing = prev.find(c => c.id === message.sender_id || c.id === message.receiver_id);
        if (existing) {
          return prev.map(c => 
            (c.id === message.sender_id || c.id === message.receiver_id)
              ? { ...c, lastMessage: message.message, timestamp: message.created_at }
              : c
          );
        }
        return prev;
      });
    });

    return () => {
      socket.off('new-message');
    };
  }, []);

  const handleNewMessage = (contactId, message) => {
    setChats(prev => {
      const existing = prev.find(c => c.id === contactId);
      if (existing) {
        return prev.map(c => 
          c.id === contactId 
            ? { ...c, lastMessage: message, timestamp: new Date().toISOString() }
            : c
        );
      }
      return prev;
    });
  };

  const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    setCurrentView('chat');
    
    setChats(prev => {
      const existing = prev.find(c => c.id === contact.id);
      if (!existing) {
        return [...prev, { 
          ...contact, 
          lastMessage: 'Start chat',
          timestamp: new Date().toISOString()
        }];
      }
      return prev;
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // ===== ОТРИСОВКА =====
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            chats={chats}
            onSelectChat={handleSelectChat}
            onOpenProfile={() => setCurrentView('profile')}
            onOpenAdmin={() => setCurrentView('admin')}
            onLogout={handleLogout}
          />
        );
      case 'chat':
        return (
          <Dashboard 
            user={user}
            chats={chats}
            onSelectChat={handleSelectChat}
            onOpenProfile={() => setCurrentView('profile')}
            onOpenAdmin={() => setCurrentView('admin')}
            onLogout={handleLogout}
            selectedChat={selectedChat}
            chatComponent={
              <Chat 
                user={user}
                contact={selectedChat}
                socket={socket}
                onNewMessage={handleNewMessage}
              />
            }
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user}
            onUpdate={setUser}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'admin':
        return (
          <AdminPanel 
            user={user}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;