

//Global Variables
let currentThreadID = null;  // Global variable to store the current thread ID


/**
 * Builds and appends categorized message thread sections to the given container.
 * @param {HTMLElement} container - The parent element to which sections will be appended.
 * @param {Object} categories - The categorized data for message threads.
 */


function buildSections(container, categories) {
    function renderCategory(category, title) {
        if (category.length > 0) {
            const sectionDiv = createDOMElement('div', 'history-section', '', container);
            createDOMElement('div', 'history-section-title', title, sectionDiv);
            var historySectionItems = createDOMElement('div', 'history-section-items', '', sectionDiv);
            
            category.forEach((thread, index) => {
                const historySectionItem = createDOMElement('div', 'history-section-item', '', historySectionItems);
                // Check if the current thread is the last one in the category
                const textClass = (index === category.length - 1) ? 'history-section-text-last' : 'history-section-text';
                const itemDiv = createDOMElement('div', textClass, thread.previewMessage, historySectionItem, () => loadMessages(thread.id));
                itemDiv.setAttribute('data-thread-id', thread.id); // Optional: For CSS or further JS manipulation
            });
        }
    }

    // Render each category
    renderCategory(categories.today, 'Today');
    renderCategory(categories.yesterday, 'Yesterday');
    renderCategory(categories.last7Days, 'Last 7 Days');
    renderCategory(categories.previous, 'Previous');
}


function loadMessages(threadId) {
    currentThreadID = threadId;  // Store globally
    const messagesRef = database.collection('users').doc(currentUserID).collection('messageThreads').doc(threadId).collection('messages');
    const messagesContainer = document.getElementById('messages-content-container');
    messagesContainer.innerHTML = '';  // Clear previous messages before setting up the listener
    messagesContainer.style.display = 'block'
    
    const existingEmptyStateContainer = document.getElementById('empty-state-container');
    
    if (existingEmptyStateContainer) {
        existingEmptyStateContainer.remove(); // Remove the previous empty state container if it exists
    }
    
    // Setting up a real-time listener
    messagesRef.orderBy('timestamp').onSnapshot(snapshot => {
        messagesContainer.innerHTML = '';  // Clear messages each time there's a change in the collection
        snapshot.forEach(doc => {
            const message = doc.data();
            displayMessage(message, messagesContainer);
        });
    }, err => {
        console.log('Error fetching messages:', err);
    });
}

function displayMessage(message, container) {
    const messageDiv = createDOMElement('div', message.role === 'user' ? 'user-message-container' : 'assistant-message-container', '', container);
    if (message.role === 'assistant') {
        const imgDiv = createDOMElement('div', 'assistant-image-div', '', messageDiv);
        createDOMElement('img', 'assistant-image', logoURL, imgDiv);
    }
    createDOMElement('div', message.role === 'user' ? 'user-message-text' : 'assistant-message-text', message.content, messageDiv);

    // Scroll to the bottom of the container
    container.scrollTop = container.scrollHeight;
}

const logoURL = "https://firebasestorage.googleapis.com/v0/b/wwjd-c3cdc.appspot.com/o/Assets%2FWWJD%20Logo%20Only.png?alt=media&token=55735401-3583-401f-b0be-c77c40400966"

