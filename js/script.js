class ChatRoom {
    usersArr = [];
    chatRoomBtn = null;
    chatRoomUserNameInput = null;
    generalChatRoom = null;
    pub = new Publisher();

    constructor() {}

    saveUser(user) {
        this.usersArr.push(user);
    }

    removeUser(user) {
        for (let i = 0; i < this.usersArr.length; i++) {
            if (this.usersArr[i] === user) {
                let client = this.usersArr[i];
                this.usersArr = this.usersArr.filter((item) => {
                    return item !== client
                })
            }
        }
    }

    findChatRoomBtn() {
        this.chatRoomBtn = document.querySelector('.addUserButton');
    }

    findChatRoomInput() {
        this.chatRoomUserNameInput = document.querySelector('.userName');
    }

    createEventListener() {
        this.chatRoomBtn.addEventListener('click', (e) => {
            if (this.chatRoomUserNameInput.value.length !== 0) {
                const userChatWindow = new ChatWindow();
                const user = new User(this.pub, this.chatRoomUserNameInput.value);
                userChatWindow.setName(this.chatRoomUserNameInput.value);
                chatRoom.saveUser(user);
                userChatWindow.createUserLayout();
                userChatWindow.initializeHtmlElem(user);
                userChatWindow.sendMessageHandler(e, 'system message', `user ${user.name} add to chat`);
            } else {
                alert('Input user name!');
            }
        });
    }
}


class Message {
    constructor(name, event, mesData) {
        this.name = name;
        this.event = event;
        this.mesData = mesData;
    }

    generateMessage(msgName, msgEvent, msgText) {
        this.name = msgName;
        this.event = msgEvent;
        this.mesData = msgText;
    }
}

class ChatWindow {
    generalChatRoom = null;

    deleteUserButton = null;
    inputMessage = null;
    sendMesageButton = null;
    chatHistory = null;

    constructor(name) {
        this.name = name;
    }

    setName(name) {
        this.name = name;
    }

    removeUserLayout(element) {
        element.remove();
    }

    initializeHtmlElem(user) {

        this.deleteUserButton = document.getElementById(`deleteUserButton-${this.name}`);
        this.deleteUserButton.addEventListener('click', (e) => {
            chatRoom.removeUser(user);
            this.removeUserLayout(e.currentTarget.parentElement.parentElement);
            this.sendMessageHandler(e, 'system message', `user ${user.name} left the chat`);
        });

        this.inputMessage = document.getElementById(`inputMessage-${this.name}`);

        this.sendMessageHandler = (event, messageEvent, messageText) => {   
            const message = new Message();
            if (messageEvent) {
                message.generateMessage(this.name, messageEvent, messageText);
            } else {
                message.generateMessage(this.name, 'send', this.inputMessage.value);
            }
            user.sendMessage(message);
            this.chatHistory = document.querySelectorAll('.chatHistory');
            const isSystemMessage = user.history[`${user.history.length - 1}`].event === 'system message';

            for (let item of this.chatHistory) {
                const isCurrentAuthorMessage = user.history[`${user.history.length - 1}`].name === item.parentElement.previousElementSibling.children[0].innerText &&
                    user.history[`${user.history.length - 1}`].event !== 'system message';

                const li = document.createElement('li');
                const deleteMessageIcon = document.createElement('img');

                li.innerText = user.history[`${user.history.length - 1}`].name + " : " + user.history[`${user.history.length - 1}`].mesData;

                if (isSystemMessage) {
                    li.className = "systemMessages";
                    li.innerText = user.history[`${user.history.length - 1}`].event + " : " + user.history[`${user.history.length - 1}`].mesData;
                }

                if (isCurrentAuthorMessage) {
                    li.className = "myMessage";
                    deleteMessageIcon.className = "deleteMyMessage";
                    deleteMessageIcon.src = './img/icons/cancel-circle.svg';
                    deleteMessageIcon.addEventListener('click', (e) => {
                        li.remove();
                    });
                }

                item.appendChild(li);
                li.appendChild(deleteMessageIcon);
            }
        };

        this.sendMesageButton = document.getElementById(`sendMesageButton-${this.name}`);
        this.sendMesageButton.addEventListener('click', this.sendMessageHandler);
    }

    createUserLayout() {
        document.body.insertAdjacentHTML(
            "beforeend",
            `<div class="userCard">
                <div class="userCardTop">
                    <span>${this.name}</span>
                    <button class="deleteUserButton" id="deleteUserButton-${this.name}">
                        <img src="./img/icons/door-open-solid.svg"></img>
                    </button>
                </div>
                <div class="userCardMain">
                    <ul class = "chatHistory" id="chatHistory-${this.name}">
                    <li>Hello!</li>
                    </ul>
                </div>
                <div class = userCardBottom>
                    <input type="text" class="inputMessage" id="inputMessage-${this.name}">
                    <button class="sendMesageButton" id="sendMesageButton-${this.name}">
                        <img src="./img/icons/paper-plane-solid.svg"></img>
                    </button>
                </div>
            </div>`
        );
    }
};


class Subscription {

    eventName = '';
    subscriber = null;
    callback = null;

    constructor(name, sub, cb) {
        this.eventName = name;
        this.subscriber = sub;
        this.callback = cb;
    }
}

class Publisher {

    subscriptions = [];
    history = [];

    subscribe(eventName, subscriber, callback) {
        // check everything
        const subscription = new Subscription(eventName, subscriber, callback)
        this.subscriptions.push(subscription)
    }

    unsubscribe(subscriber) {
        // // remove subscription by subscriber
        // if (subscriptions.subscriber === this.Subscriber) {
        //     subscriptions.remove(subscriber)
        // } //is it right?
    }

    gotHistory() {
        return this.history;
    }

    fireEvent(message) {
        this.history.push(message);
        for (let i = 0; i < this.subscriptions.length; i++) {
            const subscription = this.subscriptions[i];
            if (subscription.eventName === message.event) {
                subscription.callback(message);
            }
        }
    }
}

class User {

    name = '';
    pubsub = null;
    history = [];

    constructor(pub, name) {
        this.pubsub = pub;
        this.name = name;
        this.pubsub.subscribe('event', this, this.receiveMessage.bind(this))
        this.history = this.pubsub.gotHistory()
    }

    receiveMessage(message) {
        this.history.push(message);

    }

    sendMessage(message) {
        this.pubsub.fireEvent(message);
    }
}

const chatRoom = new ChatRoom();

chatRoom.findChatRoomBtn();
chatRoom.findChatRoomInput();
chatRoom.createEventListener();