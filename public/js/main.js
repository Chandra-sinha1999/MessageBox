const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.querySelector('#room-name');
const userList = document.querySelector('#users');


//Get Username and room from URL
const { username, room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true
}); 

const socket = io();

//join chatroom
socket.emit('joinRoom', {username,room});

//get room and users

socket.on('roomusers',({room,users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message',message=>{
    console.log(message);
    outputMessage(message);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit',(e) => {
    e.preventDefault();
    //get msg text
    const msg = e.target.elements.msg.value;
    //Emit message to a server
    socket.emit('chatMessage',msg);
    //clear input
    e.target.elements.msg.value = '';
    e.target.element.msg.focus();
});

//output Message to dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}