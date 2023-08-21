import { Manager } from 'socket.io-client';

const displayMessage = (message) => {
  const container = document.createElement('div');
  container.classList.add('chat-msg-container');

  const pEl = document.createElement('p');
  pEl.textContent = message;
  container.appendChild(pEl);

  document.querySelector('.chat').appendChild(container);
};

console.log(window.location.host);

const manager = new Manager('http://localhost:3000');

const socket = manager.socket('/');
socket.on('connect', () => {
  displayMessage(`You are connected with ID: ${socket.id}`);
});

const userSocket = manager.socket('/user', {
  auth: {
    token: '1234',
  },
});
userSocket.on('connect', () => {
  displayMessage(`You are connected to user socket with ID: ${userSocket.id}`);
});
userSocket.on('connect_error', (error) => {
  displayMessage(`User Error: ${error.message}`);
});

socket.on('recieve-message', (message) => {
  displayMessage(message);
});

const sendBtn = document.querySelector('#sendBtn');
const joinBtn = document.querySelector('#joinBtn');

sendBtn.addEventListener('click', function (event) {
  const messageEl = document.querySelector('#message');
  const message = messageEl.value;

  const roomEl = document.querySelector('#room');
  const roomId = roomEl.value;

  if (!message || !roomId) return;
  displayMessage(message);
  socket.emit('send-message', roomId, message);

  messageEl.value = '';
});

joinBtn.addEventListener('click', function (event) {
  const roomEl = document.querySelector('#room');
  const roomId = roomEl.value;

  socket.emit('join-room', roomId, (message) => {
    alert(message);
  });
  // fetch('http://localhost:3000')
  //   .then((response) => response.json())
  //   .then((data) => {
  //     alert(data.message);
  //   })
  //   .catch((error) => {
  //     alert(error);
  //   });
});
