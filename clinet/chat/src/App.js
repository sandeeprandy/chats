import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Import your CSS file for styles

const SERVER_URL = 'http://localhost:5000'; // Update with your backend server URL

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [userName, setUserName] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish Socket.io connection
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    // Fetch initial messages from backend
    fetchMessages();

    // Socket.io event listeners
    newSocket.on('chat message', message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up function
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchMessages = () => {
    fetch(`${SERVER_URL}/messages`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setMessages(data);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  };

  const sendMessage = () => {
    if (messageInput.trim() !== '' && socket) {
      // Construct the message with the user's name
      const fullMessage = `${userName}: ${messageInput}`;

      // Send message to backend
      socket.emit('chat message', fullMessage);
      setMessageInput('');
    }
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const clearMessageInput = () => {
    setMessageInput('');
    window.location.reload(); // Reload the page
  };

  return (
    <div className="container">
      <div className="background-animation"></div> {/* Background animation */}
      <div className="name-container">
        <input 
          type="text" 
          id="name" 
          value={userName} 
          onChange={handleNameChange} 
          placeholder="Enter your name" 
          className="name-input"
        />
      </div>
      <div className="message-input">
        <input
          type="text"
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          placeholder="Type your message here..."
          className="input-field"
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className="message">{message}</div>
        ))}
      </div>
      <div className="clear-button-container">
        <button onClick={clearMessageInput} className="clear-button">Clear</button>
      </div>
    </div>
  );
}

export default App;
