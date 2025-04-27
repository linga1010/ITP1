import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Adminnaviagtion from "../Component/Adminnavigation";

let socket;

function AdminChatPage() {
  const [users, setUsers] = useState([]); // All users who messaged
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Messages with selected user

  useEffect(() => {
    // Connect to socket server
    socket = io('http://localhost:5000');

    // Admin joins room as 'admin'
    socket.emit('joinRoom', 'admin');

    // Get the live user list from backend
    socket.on('userList', (userList) => {
        console.log('Received userList:', userList); // ✅ Debugging line
        setUsers(userList.filter(user => user._id !== 'admin'));
      });

    // Listen for incoming messages
    socket.on('message', (msg) => {
      // If message is from or to the selected user, add it to messages
      if (msg.senderId === selectedUser?._id || msg.receiverId === selectedUser?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${user._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching user chats:', error);
    }
  };

  const sendMessage = () => {
    if (message.trim() === '' || !selectedUser) return;

    // Send the message to the backend via socket
    socket.emit('sendMessage', {
      senderEmail: 'admin', // Admin is sender
      receiverEmail: selectedUser._id, // User is receiver
      message,
    });

    setMessage('');
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <div style={{ display: 'flex', height: '100vh' }}>
          
          {/* Users List */}
          <div style={{ width: '25%', borderRight: '1px solid gray', padding: '10px', overflowY: 'scroll' }}>
            <h3>Users</h3>
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                style={{ padding: '10px', cursor: 'pointer', backgroundColor: selectedUser?._id === user._id ? '#ddd' : 'white' }}
              >
                {user.name}
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div style={{ width: '75%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                <h3>Chat with {selectedUser.name}</h3>

                <div style={{ flex: 1, overflowY: 'scroll', border: '1px solid gray', padding: '10px', marginBottom: '10px' }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <strong>{msg.senderId === 'admin' ? "You" : selectedUser.name}:</strong> {msg.message}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, marginRight: '10px' }}
                  />
                  <button onClick={sendMessage}>Send</button>
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
