const MOCK_API_URL = 'https://67b5e73b07ba6e59083f0107.mockapi.io/messege';

const messageContainer = document.querySelector('#message-container');
const sendMessageForm = document.querySelector('#send-message-form');
const sendMessageInput = sendMessageForm.querySelector('#send-message-input');
const sendMessageBtn = sendMessageForm.querySelector('#send-message-btn');
const sendMessageUserName = sendMessageForm.querySelector('#send-message-input-name');
let userName = JSON.parse(localStorage.getItem('user-name')) || 'User';
let messages = [];

const saveUserNameToLocalStorage = () => {
    localStorage.setItem('user-name', JSON.stringify(userName))
}

const getUserName = () => {
    if (userName === 'User' || userName === null) {
        userName = sendMessageUserName.value.trim() || 'User';
        saveUserNameToLocalStorage();
    } else {
        sendMessageUserName.style.display = 'none';
        sendMessageUserName.removeAttribute('required')
    }
     
}

if (userName === 'User') {
    sendMessageUserName.style.display = 'block';
    sendMessageUserName.setAttribute('required', '');
}

const renderMessages = () => {
    messageContainer.innerHTML = '';
    const copyMessages = [...messages]
    copyMessages.reverse().forEach(message => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';

        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';

        const userName = document.createElement('h2');
        userName.className = 'message-user-name';
        userName.textContent = JSON.parse(message.name);
        
        const userTag = document.createElement('h2');
        userTag.className = 'message-user-tag';
        userTag.textContent = `@${JSON.parse(message.name)}`.toLocaleLowerCase();

        const messageCreatedAt = document.createElement('p');
        messageCreatedAt.className = 'message-created-at';
        messageCreatedAt.textContent = `${new Date(Date.parse(message.createdAt)).toLocaleDateString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
        })}`;

        const messageContent = document.createElement('p');
        messageContent.className = 'message-content';
        messageContent.textContent = message.message;

        messageInfo.append(userName, userTag ,messageCreatedAt);
        messageWrapper.append(messageInfo, messageContent);

        messageContainer.append(messageWrapper);
    });
}

sendMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addMessages();
});

const cleanupOldMessages = async () => {
    try {
        const response = await fetch(MOCK_API_URL);
        const allMessages = await response.json();
        
        const sortedMessages = allMessages.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        if (sortedMessages.length > 80) {
            const messagesToDelete = sortedMessages.slice(0, 20);
            
            const deletePromises = messagesToDelete.map(message => 
                fetch(`${MOCK_API_URL}/${message.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-type': 'application/json',
                    }
                })
            );
            
            await Promise.all(deletePromises);
        }
    } catch (error) {
        console.error('Ошибка при очистке старых сообщений:', error);
    }
};

const addMessages = async () => {
    try {
        getUserName();
        if (messages.length >= 80) {
            await cleanupOldMessages();
        }

        const message = sendMessageInput.value.trim();
        if (message) {
            await fetch(MOCK_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    createdAt: new Date().toISOString(),
                    name: JSON.stringify(userName),
                    message: sendMessageInput.value,
                }),
                headers: {
                    'Content-type': 'application/json',
                }
            })
            await getMessages();
            
    
            if (message) {
                sendMessageInput.value = ''; 
            }
        }

    } catch (error) {
        console.error('Ошибка при отправки сообщения', error);
    }
}


const getMessages = async () => {
    try {
        const response = await fetch(MOCK_API_URL);
        messages = await response.json();


        renderMessages();
    } catch (error) {
        console.error('Ошибка при получении сообщений', error);
    }
}


getMessages();
setInterval(getMessages, 5000);
