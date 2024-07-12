


/**
 * Creates a DOM element and appends it to a specified parent element.
 * @param {string} type - The type of the HTML element to create.
 * @param {string} className - The CSS class for the element.
 * @param {string} value - The text content or src for the element.
 * @param {HTMLElement} parent - The parent element to which the new element will be appended.
 * @param {function} onClick - The action for the element to perfom when clicked.
 */
function createDOMElement(type, className, value, parent, onClick) {
    let element = document.createElement(type);
    element.className = className;
    if (type === 'img') {
        element.src = value;
    } else {
        element.textContent = value;
    }
    if (onClick) {
        element.addEventListener('click', onClick);
    }
    parent.appendChild(element);
    return element;
}


document.addEventListener('DOMContentLoaded', function() {    
    showEmptyState()
    const messageField = document.getElementById('message-field');
    const sendButton = document.getElementById('send-message');

    sendButton.addEventListener('click', function() {
        sendUserMessage();
    });

    messageField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendUserMessage();
        }
    });
});

function fetchMessageThreads(userId) {
    const userThreadsRef = database.collection('users').doc(userId).collection('messageThreads');
    const historyContainer = document.getElementById('history-container');

    userThreadsRef.onSnapshot(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            historyContainer.innerHTML = ''; // Clear previous contents
            return;
        }

        const categories = {
            today: [],
            yesterday: [],
            last7Days: [],
            previous: []
        };

        const now = new Date();
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = new Date(today - 86400000); // 86400000ms = 1 day
        const sevenDaysAgo = new Date(today - 604800000); // 604800000ms = 7 days

        let threads = [];

        snapshot.forEach(doc => {
            const threadData = doc.data();
            if (threadData.status !== 'active') return; // Skip non-active threads
            threadData.dateCreated = new Date(threadData.dateCreated.seconds * 1000); // Convert timestamp to Date
            threads.push(threadData);
        });

        // Sort threads by dateCreated in descending order
        threads.sort((a, b) => b.dateCreated - a.dateCreated);

        // Categorize threads based on the sorted result
        threads.forEach(threadData => {
            if (threadData.dateCreated >= today) {
                categories.today.push(threadData);
            } else if (threadData.dateCreated >= yesterday && threadData.dateCreated < today) {
                categories.yesterday.push(threadData);
            } else if (threadData.dateCreated >= sevenDaysAgo && threadData.dateCreated < yesterday) {
                categories.last7Days.push(threadData);
            } else {
                categories.previous.push(threadData);
            }
        });

        // Clear previous contents
        historyContainer.innerHTML = '';
        
        // Build sections with categorized data
        buildSections(historyContainer, categories);
    }, err => {
        console.log('Error getting documents', err);
    });
}


function sendUserMessage() {
    const messageField = document.getElementById('message-field');
    const input = messageField.value; 
    if (!input.trim()) return;

    if (isSubscribed || tokensRemaining > 0) {
        if (!currentThreadID) {
            startConversation(input).then(() => {
                sendMessageToServer(input);
            }).catch(error => {
                console.error('Failed to start conversation:', error);
            });
        } else {
            sendMessageToServer(input);
        }
    } else {
        window.location.href = '/subscribe'
    }

}

function startConversation(previewMessage) {
    return fetch('https://wwtd-production-3707e3eba4af.herokuapp.com//start_conversation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            preview_message: previewMessage,
            model: 'gpt-4o',
            thread_id: currentThreadID,
            user_id : currentUserID
        })
    })
    .then(response => response.json())
    .then(data => {
        currentThreadID = data.thread_id;  // Set the newly created thread ID globally
        console.log("Current Thread", currentThreadID)
        loadMessages(currentThreadID)
        return data.thread_id;  // Return thread ID if needed for further processing
    });
}

function sendMessageToServer(input) {
    const messageField = document.getElementById('message-field');

    fetch('https://wwtd-production-3707e3eba4af.herokuapp.com//send_query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: input,
            model: 'gpt-4o',
            thread_id: currentThreadID,
            user_id : currentUserID
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(`Updated response in thread: ${currentThreadID} for data:\n${data.response}`);
        messageField.value = '';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function showEmptyState() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';  // Clear previous messages
    currentThreadID = null
    
    const emptyStateContainer = createDOMElement('div', 'empty-state-container', '' , messagesContainer)
    emptyStateContainer.style.backgroundImage = "url('https://firebasestorage.googleapis.com/v0/b/wwjd-c3cdc.appspot.com/o/Assets%2FWWJD%20Logo%20Circle.png?alt=media&token=5e81c983-62b5-4f74-9014-23d03ef9804d')";

    const presetPromptsContainer = createDOMElement('div', 'preset-prompts-container', '' , emptyStateContainer)
    const presets = [
        "How can I strengthen my faith?",
        "How can I overcome temptation?",
        "What is God's purpose for my life?",
        "How can I find peace in difficult times?",
        "What does the Bible say about forgiveness?",
        "What should I do when I feel lost or unsure?",
        "How can I serve others in my community?",
        "What does it mean to live a Christ-centered life?",
        "How should I handle conflict with others?",
        "How can I improve my prayer life?",
        "What does it mean to love your neighbor?",
        "How can I grow spiritually?",
        "What is the significance of baptism?",
        "How can I trust God more fully?",
        "What does it mean to live by faith and not by sight?",
        "How can I find comfort in times of grief?",
        "What does the Bible say about marriage and family?",
        "How can I share my faith with others?",
        "What is the importance of regular worship?"
    ];

    presets.forEach(preset => {
        createDOMElement('div', 'preset-prompt-text', preset, presetPromptsContainer, function() {
            console.log(preset);
            if (!currentThreadID) {
                startConversation(preset).then(() => {
                    sendMessageToServer(preset);
                }).catch(error => {
                    console.error('Failed to start conversation:', error);
                });
            } else {
                sendMessageToServer(preset);
            }
        });
    });
}