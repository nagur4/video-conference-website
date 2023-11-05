const socket = io();
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const videoContainer = document.getElementById('video-container');
const chatContainer = document.getElementById('chat-container');
const recordContainer = document.getElementById('record-container');
const startRecordButton = document.getElementById('start-record');
const stopRecordButton = document.getElementById('stop-record');
const recordTimer = document.getElementById('record-timer');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

let mediaRecorder;
let recordedChunks = [];
let recordStartTime;
let recordInterval;
let videoStream;

startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  stopButton.style.display = 'block';
  videoContainer.style.display = 'block';
  chatContainer.style.display = 'block';
  recordContainer.style.display = 'block';

  // Now, you can initiate video chat
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      const localVideo = document.getElementById('localVideo');
      localVideo.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = handleDataAvailable;
      videoStream = stream;
    })
    .catch((error) => {
      console.error('Error accessing the camera and microphone:', error);
    });
});

stopButton.addEventListener('click', () => {
  startButton.style.display = 'block';
  stopButton.style.display = 'none';
  videoContainer.style.display = 'none';
  chatContainer.style.display = 'none';
  recordContainer.style.display = 'none';

  // Stop video chat and close camera and microphone
  if (videoStream) {
    videoStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Stop video recording if it's ongoing
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordInterval);
  }
});

sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('chat message', message);
    chatMessages.innerHTML += `<p>You: ${message}</p>`;
    messageInput.value = '';
  }
});

socket.on('chat message', (message) => {
  chatMessages.innerHTML += `<p>Other User: ${message}</p>`;
});

startRecordButton.addEventListener('click', () => {
  recordedChunks = [];
  mediaRecorder.start();
  startRecordButton.disabled = true;
  stopRecordButton.disabled = false;
  recordStartTime = Date.now();
  recordInterval = setInterval(updateRecordTimer, 1000);
  recordTimer.style.display = 'block';
});

stopRecordButton.addEventListener('click', () => {
  mediaRecorder.stop();
  clearInterval(recordInterval);
  startRecordButton.disabled = false;
  stopRecordButton.disabled = true;
  recordTimer.style.display = 'none';
});

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

function updateRecordTimer() {
  const elapsedTime = (Date.now() - recordStartTime) / 1000;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = Math.floor(elapsedTime % 60);
  recordTimer.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
