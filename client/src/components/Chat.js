import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messages } from '../api';

function Chat({ user, contact, socket, onNewMessage }) {
  const [messageList, setMessageList] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!contact) return;
    setIsLoading(true);
    try {
      const res = await messages.get(contact.id);
      setMessageList(res.data || []);
    } catch (e) {
      console.error('Error loading messages', e);
    }
    setIsLoading(false);
  }, [contact]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !contact) return;
    
    const text = inputMessage.trim();
    setInputMessage('');
    
    try {
      await messages.send(contact.id, text);
      
      const newMsg = {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: contact.id,
        message: text,
        created_at: new Date().toISOString()
      };
      setMessageList(prev => [...prev, newMsg]);
      
      if (onNewMessage) {
        onNewMessage(contact.id, text);
      }
      
      setTimeout(() => loadMessages(), 500);
    } catch (e) {
      console.error('Error sending message', e);
      setInputMessage(text);
    }
  };

  useEffect(() => {
    if (!contact) return;
    loadMessages();

    const handleNewMessage = (msg) => {
      if ((msg.sender_id === contact.id && msg.receiver_id === user.id) ||
          (msg.sender_id === user.id && msg.receiver_id === contact.id)) {
        setMessageList(prev => [...prev, msg]);
        if (onNewMessage) {
          onNewMessage(contact.id, msg.message);
        }
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [contact, user.id, socket, loadMessages, onNewMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!contact) {
    return (
      <div className="empty-chat">
        <span className="empty-chat-icon">💬</span>
        <h2>Clone</h2>
        <p>End-to-End Encrypted</p>
        <p className="empty-sub">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="chat-full">
      {/* ХЕДЕР ЧАТА */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {contact.avatar ? (
              <img src={`http://localhost:5000/uploads/avatars/${contact.avatar}`} alt="Avatar" />
            ) : (
              contact.name?.[0] || '?'
            )}
          </div>
          <div>
            <div className="chat-user-name">{contact.name}</div>
            <div className="chat-user-status">
              {contact.username && <span>@{contact.username} · </span>}
              Online
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="icon-btn">📹</button>
        </div>
      </div>

      {/* СООБЩЕНИЯ */}
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-messages">Loading...</div>
        ) : messageList.length === 0 ? (
          <div className="empty-messages">
            <span>No messages yet</span>
            <p>Send your first message</p>
          </div>
        ) : (
          messageList.map((msg, index) => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div
                key={msg.id || index}
                className={`message-bubble ${isOwn ? 'own' : 'other'}`}
              >
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : ''}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ВВОД СООБЩЕНИЯ */}
      <div className="message-input-area">
        <button className="attach-btn">📎</button>
        <input
          type="text"
          placeholder="Message..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default Chat;