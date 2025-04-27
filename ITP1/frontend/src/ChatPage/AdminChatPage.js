import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Adminnaviagtion from "../Component/Adminnavigation";
import * as timeago from 'timeago.js';

let socket;
const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

function AdminChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadUsers, setUnreadUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeen, setLastSeen] = useState({});
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [seenStatus, setSeenStatus] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.emit('joinRoom', 'admin');

    socket.on('userList', (userList) => {
      const nonAdminUsers = userList
        .filter(user => user._id !== 'admin')
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setUsers(nonAdminUsers);
    });

    socket.on('message', (msg) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        setUnreadUsers((prev) => new Set([...prev, msg.senderId]));
      }
    });

    socket.on('typing', ({ sender }) => {
      if (selectedUser && sender === selectedUser._id) {
        setIsUserTyping(true);
        setTimeout(() => setIsUserTyping(false), 2000);
      }
    });

    socket.on('messagesRead', ({ reader }) => {
      if (selectedUser && reader === selectedUser._id) {
        setSeenStatus(true);
      }
    });

    socket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => [...prev, userId]);
    });

    socket.on('userOffline', ({ userId, lastSeenAt }) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId));
      setLastSeen((prev) => ({ ...prev, [userId]: lastSeenAt }));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setUnreadUsers(prev => {
      const updated = new Set(prev);
      updated.delete(user._id);
      return updated;
    });
    setSeenStatus(false);

    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${user._id}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching user chats:', error);
    }
  };

  const sendMessage = () => {
    if (message.trim() === '' || !selectedUser) return;

    socket.emit('sendMessage', {
      senderEmail: 'admin',
      receiverEmail: selectedUser._id,
      message,
    });

    setMessage('');
    setSeenStatus(false);
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', {
        senderEmail: 'admin',
        receiverEmail: selectedUser._id,
      });
    }
  };

  const handleReadMessages = () => {
    if (selectedUser) {
      socket.emit('readMessages', {
        readerEmail: 'admin',
        partnerEmail: selectedUser._id,
      });
    }
  };

  const getUserStatus = (user) => {
    if (onlineUsers.includes(user._id)) {
      return <span style={{ color: 'green', fontSize: '12px' }}>🟢 Online</span>;
    }
    if (lastSeen[user._id]) {
      return <span style={{ color: 'gray', fontSize: '12px' }}>Last seen {timeago.format(lastSeen[user._id])}</span>;
    }
    return <span style={{ color: 'gray', fontSize: '12px' }}>Offline</span>;
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br /></p><p><br /></p>
      <div className="main-content">
        <div style={{ display: 'flex', height: '100vh' }}>
          
          {/* Users List */}
          <div style={{ width: '500px', borderRight: '1px solid gray', padding: '10px', overflowY: 'scroll' }}>
            <h3>Users</h3>
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: selectedUser?._id === user._id ? '#f0f0f0' : 'white',
                  borderBottom: '1px solid #ccc'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={user.profilePic || defaultProfilePicUrl}
                      alt="Profile"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <span>{user.name}</span>
                  </div>
                  {getUserStatus(user)}
                </div>

                <div>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      backgroundColor: unreadUsers.has(user._id) ? 'red' : 'white',
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div style={{ width: '75%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <img
                    src={selectedUser.profilePic || defaultProfilePicUrl}
                    alt="Profile"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                  />
                  <div>
                    <h3>Chat with {selectedUser.name}</h3>
                    {getUserStatus(selectedUser)}
                  </div>
                </div>

                <div
                  ref={chatBoxRef}
                  onClick={handleReadMessages}
                  onScroll={handleReadMessages}
                  style={{ flex: 1, overflowY: 'scroll', border: '1px solid gray', padding: '10px', marginBottom: '10px' }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '10px',
                        textAlign: msg.senderId === 'admin' ? 'right' : 'left'
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: msg.senderId === 'admin' ? '#DCF8C6' : '#FFF',
                          padding: '8px 12px',
                          borderRadius: '15px',
                          maxWidth: '60%',
                          wordWrap: 'break-word',
                          position: 'relative'
                        }}
                      >
                        {msg.message}
                        <div style={{ fontSize: '10px', color: 'gray', marginTop: '5px', textAlign: 'right' }}>
                          {timeago.format(msg.createdAt)}
                          {idx === messages.length - 1 && msg.senderId === 'admin' && seenStatus && (
                            <span style={{ marginLeft: '5px', color: 'blue' }}>Seen ✅</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isUserTyping && (
                    <div style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>
                      {selectedUser.name} is typing...
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      handleTyping();
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    style={{ flex: 1, marginRight: '10px', padding: '10px', borderRadius: '20px', border: '1px solid gray' }}
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
              </>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h3>Select a user to start chatting</h3>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminChatPage;
