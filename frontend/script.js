let currentUser = localStorage.getItem('username');

function registerUser(username, password) {
  return fetch('http://localhost:8000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password })
  });
}

function loadChats() {
  fetch(`http://localhost:8000/chats/${currentUser}`)
    .then(response => response.json())
    .then(data => {
      const chatList = document.getElementById('chatList');
      chatList.innerHTML = "";
      data.chats.forEach(chat => {
        const li = document.createElement('li');
        li.textContent = chat.message + " (" + new Date(chat.timestamp).toLocaleString() + ")";
        chatList.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Failed to load chats", error);
    });
}

if (!currentUser) {
  // Prompt user for registration details
  currentUser = prompt("Enter your username:");
  const password = prompt("Enter your password:");
  registerUser(currentUser, password)
    .then(response => {
      if (response.ok) {
        localStorage.setItem('username', currentUser);
        loadChats();
      } else {
        alert("Registration failed. Try again.");
      }
    })
    .catch(error => {
      console.error("User registration failed", error);
    });
} else {
  loadChats();
}

document.getElementById('newChatButton').addEventListener('click', function(){
  // Clear the main chat area for starting a new conversation
  document.getElementById('chatMessages').innerHTML = "";
});

document.getElementById('sendButton').addEventListener('click', function(){
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  if(message) {
    addMessage(message, 'user');
    input.value = '';
    // Send message to backend
    fetch('http://localhost:8000/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, username: currentUser })
    })
    .then(response => response.json())
    .then(data => {
      if(data.message) {
        addMessage(data.message, 'bot');
        // Save the chat in the database
        fetch('http://localhost:8000/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser, message: message })
        })
        .then(() => loadChats())
        .catch(error => console.error("Error saving chat", error));
      } else {
        addMessage('No response from server.', 'bot');
      }
    })
    .catch(error => {
      addMessage('Error contacting server', 'bot');
      console.error('Error:', error);
    });
  }
});

document.getElementById('messageInput').addEventListener('keypress', function(e) {
  if(e.key === 'Enter'){
    document.getElementById('sendButton').click();
  }
});

function addMessage(text, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const messageElem = document.createElement('div');
  messageElem.classList.add('message', sender);
  messageElem.textContent = text;
  chatMessages.appendChild(messageElem);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
