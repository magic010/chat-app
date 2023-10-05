const app = () => {
  const socket = io('localhost:3000', { transports: ['websocket'] });
  const msgInput = document.querySelector('.message-input');
  const msgList = document.querySelector('.messages-list');
  const sendBtn = document.querySelector('.send-btn');
  const usernameInput = document.querySelector('.username-input');
  const messages = [];

  const getMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/chat', {});
      const data = response.data;

      renderMessages(data);

      messages.push(...data);
    } catch (error) {
      console.log(error.message);
    }
  };

  getMessages();

  const handleSendMessage = (text) => {
    if (text.trim().length === 0) return;

    const message = {
      username: usernameInput.value || 'Anonymous',
      text,
      createdAt: new Date(),
    };

    sendMessage(message);

    msgInput.value = '';
  };

  msgInput.addEventListener(
    'keydown',
    (e) => e.keyCode === 13 && handleSendMessage(e.target.value),
  );

  sendBtn.addEventListener('click', () => handleSendMessage(msgInput.value));

  const renderMessages = (data) => {
    const messages = data
      .map(
        (message) => `
      <li class="bg-dark p-2 rounded mb-2 d-flex justify-content-between message">
          <div class="mr-2">
              <span class="text-info">${message.username}</span>
              <p class="text-light">${message.text}</p>
          </div>
          <span class="text-muted text-right date">
              ${new Date(message.createdAt).toLocaleString('en', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
          </span>
      </li>`,
      )
      .join('');

    msgList.innerHTML = messages;
  };

  const sendMessage = (message) => socket.emit('sendMessage', message);

  socket.on('recMessage', (message) => {
    messages.push(message);
    renderMessages(messages);
  });
};

app();
