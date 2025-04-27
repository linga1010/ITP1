import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Create socket connection inside the component to avoid multiple connections
let socket;

function UserChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user) return;
  
    // Initialize socket connection
    socket = io('http://localhost:5000', {
      query: { userEmail: user.email }, // Pass user email as a query parameter
    });
  
    // Join user room
    socket.emit('joinRoom', user.email);
  
    // Fetch old chats from backend when page loads
    const fetchOldChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${user.email}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    };
  
    fetchOldChats();
  
    // Listen for incoming real-time messages
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  
    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user]);
  

  const sendMessage = () => {
    if (message.trim() === "") return;
  
    // Send message to admin
    socket.emit('sendMessage', {
      senderEmail: user.email,    // ✅ senderEmail (not senderId)
      receiverEmail: 'admin',     // ✅ receiverEmail (not receiverId)
      message,
    });
  
    // Clear the input field
    setMessage("");
  };
  
  

  return (
    <div>
      <h1>Chat with Admin</h1>
      <div style={{ maxHeight: '400px', overflowY: 'scroll', border: '1px solid gray', padding: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{msg.senderId === user.email ? "You" : "Admin"}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default UserChat;