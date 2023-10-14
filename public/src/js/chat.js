document.addEventListener('DOMContentLoaded', async function () {
    const btnSend = document.querySelector('#btn-send');
    const messageBox = document.querySelector('#message-box');
    const chatDisplayContainer = document.querySelector('#chat-display-container');
    const tagUsername = document.querySelector('#username');
    const socket = io();

    const url = 'http://127.0.0.1:3000/api/userInfo';
    const response = await Fetch.get(url);
    let loggedUserID = response.data[0].id;
    let username = response.data[0].username;
    tagUsername.innerHTML = '@'+username;

    // Convo data init
    const convoRes = await getConvoData();
    const convoData = convoRes.data;
    console.log(convoData);

    convoData.forEach(msg => {
        console.log(msg.message);
        const div = document.createElement("div");
        if (msg.user_id == loggedUserID) {
            div.innerHTML = `<div class="d-flex flex-row justify-content-end align-items-end mb-4">
                                <div class="p-3 me-3" style="border-radius: 15px; background-color: rgba(57, 192, 237, .2);">
                                    <p id="chat-message" class="small mb-0 text-break">${msg.message}</p>
                                </div>
                                <img src="./src/img/default-blue-av.png" alt="avatar 1" style="width: 45px; height: 100%;">
                            </div>`;            
        } else {
            div.innerHTML = `<div class="d-flex flex-row justify-content-start align-items-start mb-4">
                                <img src="./src/img/default-red-av.png" alt="avatar 1" style="width: 45px; height: 100%;">
                                <div class="p-3 ms-3" style="border-radius: 15px; background-color: #F5F5F5;">
                                    <p id="chat-message" class="small mb-0 text-break">${msg.message}</p>
                                </div>
                                
                            </div>`;
        }
        chatDisplayContainer.appendChild(div);
        messageBox.value = '';
    });


    console.log(loggedUserID);

    socket.on("connect", () => {
        console.log("connected");
    });

    btnSend.addEventListener('click', function() {
        socket.emit("chat message", messageBox.value);
    });

    socket.on("chat message", (message) => {
        const div = document.createElement("div");

        if (message.userID == loggedUserID) {
            div.innerHTML = `<div class="d-flex flex-row justify-content-end align-items-end mb-4">
                                <div class="p-3 me-3" style="border-radius: 15px; background-color: rgba(57, 192, 237, .2);">
                                    <p id="chat-message" class="small mb-0 text-break">${message.message}</p>
                                </div>
                                <img src="./src/img/default-blue-av.png" alt="avatar 1" style="width: 45px; height: 100%;">
                            </div>`;
        } else {
            div.innerHTML = `<div class="d-flex flex-row justify-content-start align-items-start mb-4">
                                <img src="./src/img/default-red-av.png" alt="avatar 1" style="width: 45px; height: 100%;">
                                <div class="p-3 ms-3" style="border-radius: 15px; background-color: #F5F5F5;">
                                    <p id="chat-message" class="small mb-0 text-break">${message.message}</p>
                                </div>
                                
                            </div>`;
        }
        chatDisplayContainer.appendChild(div);
        messageBox.value = '';
    });
});

const getConvoData = async() => {
    const convoAPI = 'http://127.0.0.1:3000/api/convo';
    const dataRes = await Fetch.get(convoAPI);
    return dataRes;

};