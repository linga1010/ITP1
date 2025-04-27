import { useAuth } from '../hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import * as timeago from 'timeago.js';

let socket;
let typingTimeout;

function UserChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [seenStatus, setSeenStatus] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5000', {
      query: { userEmail: user.email },
    });

    socket.emit('joinRoom', user.email);

    const fetchOldChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${user.email}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    };

    fetchOldChats();

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('typing', ({ sender }) => {
      if (sender === 'admin') {
        setIsAdminTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setIsAdminTyping(false), 2000); // Typing disappears after 2s
      }
    });

    socket.on('messagesRead', ({ reader }) => {
      if (reader === 'admin') {
        setSeenStatus(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit('sendMessage', {
      senderEmail: user.email,
      receiverEmail: 'admin',
      message,
    });

    setMessage('');
    setSeenStatus(false);
  };

  const handleTyping = () => {
    socket.emit('typing', {
      senderEmail: user.email,
      receiverEmail: 'admin',
    });
  };

  const handleReadMessages = () => {
    socket.emit('readMessages', {
      readerEmail: user.email,
      partnerEmail: 'admin',
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Chat with Admin</h2>
      <div
        ref={chatBoxRef}
        onClick={handleReadMessages}
        onScroll={handleReadMessages}
        style={{
          height: '500px',
          overflowY: 'scroll',
          border: '1px solid gray',
          borderRadius: '10px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          marginBottom: '20px'
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === user.email ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
              position: 'relative'
            }}
          >
            <div
              style={{
                backgroundColor: msg.senderId === user.email ? '#DCF8C6' : '#FFF',
                padding: '10px 15px',
                borderRadius: '20px',
                maxWidth: '60%',
                wordBreak: 'break-word',
                position: 'relative'
              }}
            >
              {msg.message}
              <div style={{ fontSize: '10px', color: 'gray', marginTop: '5px', textAlign: 'right' }}>
                {timeago.format(msg.createdAt)}
                {idx === messages.length - 1 && msg.senderId === user.email && seenStatus && (
                  <span style={{ marginLeft: '5px', color: 'blue' }}>Seen ✅</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isAdminTyping && (
          <div style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>
            Admin is typing...
          </div>
        )}
      </div>

      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          style={{
            flex: 1,
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid gray',
            marginRight: '10px',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default UserChat;
