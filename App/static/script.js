/**
 * Preprocess the server response for safe HTML display and format code snippets.
 * @param {string} rsp - The response from the server.
 * @returns {string} Safe and formatted HTML string.
 */
function cleanOutput(rsp) {
    // Convert angle brackets to prevent HTML injection
    rsp = rsp.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Handle code snippets by wrapping them in <pre> tags for proper formatting
    rsp = rsp.replace(/```[^\s]+/g, "<pre>"); // Start code block
    rsp = rsp.replace(/```/g, "</pre>"); // End code block
    
    // Convert markdown to HTML
    var converter = new showdown.Converter();
    var safeHtml = converter.makeHtml(rsp);
    return safeHtml;
}

/**
 * Sends a text message to the server and handles the streaming response.
 */
function sendMessage() {
    let session_id = document.getElementById('session_id').value;
    var input = document.getElementById("chat-input");
    var text = input.value.trim();
    if (text === "") return;

    addOutgoingMessage(text);
    input.value = "";

    // Initialize EventSource
    var streamUrl = `/stream-send?text=${encodeURIComponent(text)}&session_id=${encodeURIComponent(session_id)}`;
    var eventSource = new EventSource(streamUrl);
    let incomingMessage;
    var incomingText="";

    eventSource.onmessage = function(event) {       
        var data = JSON.parse(event.data);
        if (data.endOfMessage) {
            eventSource.close();
        } else {
            [incomingMessage,incomingText] = addIncomingMessage(data.response,incomingMessage,incomingText);
        }
    };

    eventSource.onerror = function() {
        // Close the event source if there's an error and log the error
        eventSource.close();
        console.error('EventSource failed.');
    };
}

/**
 * Sends an audio message to the server and handles the streaming response.
 * @param {string} text - Transcribed audio text to send.
 */
function sendMessage_audio(text) {
    let session_id = document.getElementById('session_id').value;
    addOutgoingMessage(text);

    var streamUrl = `/stream-send?text=${encodeURIComponent(text)}&session_id=${encodeURIComponent(session_id)}`;
    var eventSource = new EventSource(streamUrl);

    let incomingMessage;
    var incomingText="";

    eventSource.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.endOfMessage) {
            eventSource.close();
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(incomingMessage.innerText);
            utterance.voice = synth.getVoices().find(voice => voice.lang.startsWith('en'));
            utterance.onend = function(event){
                document.getElementById("startRecord").disabled = false;
            }
            synth.speak(utterance);
        } else {
            [incomingMessage,incomingText] = addIncomingMessage(data.response,incomingMessage,incomingText);
        }
    };

    eventSource.onerror = function() {
        eventSource.close();
        console.error('EventSource failed.');
    };
}

/**
 * Adds a user's message to the chat interface.
 * @param {string} promptText - Text to be added as an outgoing message.
 */
function addOutgoingMessage(promptText){
    var messages = document.getElementById("messages");

    var outgoingMessage = document.createElement("div");
    outgoingMessage.classList.add("message", "outgoing");

    // Avantar and Label container
    var labelContainer = document.createElement("div");
    labelContainer.classList.add("labelContainer");

    // Label
    var userLabel = document.createElement("span");
    userLabel.classList.add("label");
    userLabel.textContent = "User";
    labelContainer.appendChild(userLabel);

    // Add avatar image for assistant
    var avatarImg = document.createElement("img");
    avatarImg.src = "/static/user.webp"; // The path to your avatar image
    avatarImg.alt = "Assistant";
    avatarImg.classList.add("avatar");
    labelContainer.appendChild(avatarImg);

    outgoingMessage.appendChild(labelContainer);
    outgoingMessage.append(document.createTextNode(promptText));
    messages.appendChild(outgoingMessage);
    messages.scrollTop = messages.scrollHeight;
}


/**
 * Adds the server's response to the chat interface.
 * @param {string} responseText - Server's response text.
 * @param {Element} incomingMessage - HTML element containing the incoming message.
 * @param {string} incomingText - Accumulated response text.
 * @returns {[Element, string]} Updated HTML element and text.
 */
function addIncomingMessage(responseText,incomingMessage,incomingText) {
    var messages = document.getElementById("messages");
    incomingText+=responseText

    if (!incomingMessage) {
        incomingMessage = document.createElement("div");
        incomingMessage.classList.add("message", "incoming");

        // Avantar and Label container
        var labelContainer = document.createElement("div");
        labelContainer.classList.add("labelContainer");

        // Add avatar image for assistant
        var avatarImg = document.createElement("img");
        avatarImg.src = "/static/assistant.webp"; // The path to your avatar image
        avatarImg.alt = "Assistant";
        avatarImg.classList.add("avatar");
        labelContainer.appendChild(avatarImg);

        // Add assistant label
        var assistantLabel = document.createElement("span");
        assistantLabel.classList.add("label");
        assistantLabel.textContent = "Assistant";
        labelContainer.appendChild(assistantLabel);

        incomingMessage.appendChild(labelContainer);

        // Create a new div to wrap the response text
        var responseContent = document.createElement("div");
        responseContent.classList.add("response-content");
        responseContent.innerHTML = cleanOutput(incomingText);
        incomingMessage.appendChild(responseContent);
        messages.appendChild(incomingMessage);

    } else {
        var responseContent = incomingMessage.querySelector(".response-content");
        responseContent.innerHTML = cleanOutput(incomingText);
    }

    messages.scrollTop = messages.scrollHeight;
    return [incomingMessage,incomingText];
}

/**
 * Initializes the recording process to capture user audio.
 */
function startRecording() {
    document.getElementById("startRecord").style.display = "none";
    document.getElementById("startRecord").disabled = true;
    document.getElementById("stopRecord").style.display = "inline-block";

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const options = { mimeType: 'audio/wav' };
            if (MediaRecorder.isTypeSupported(options.mimeType)) {
                mediaRecorder = new MediaRecorder(stream, options);
            } else {
                console.log('WAV format not supported, falling back to default MIME type.');
                mediaRecorder = new MediaRecorder(stream);
            }
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.start();
            document.getElementById("stopRecord").disabled = false;
            audioChunks = [];
        });
}

/**
 * Stops the recording process and sends the captured audio to the server.
 */
function stopRecording() {
    document.getElementById("startRecord").style.display = "inline-block";
    document.getElementById("stopRecord").style.display = "none";

    mediaRecorder.stop();
    document.getElementById("stopRecord").disabled = true;
    mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const formData = new FormData();
        formData.append("audioFile", audioBlob);

        fetch('/upload-audio', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Add Transcription and Message from LLM
            sendMessage_audio(data.transcription); 
            
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("startRecord").disabled = false;
        });
    };
}

// Function to handle keyboard events
function handleKeyDown(event) {
    // Check if the key pressed is the space key
    if (event.key === ' ' || event.code === 'Space') {
        // Stop the reading action
        stopReading();
        document.getElementById("startRecord").disabled = false;
    }
}

// Function to stop reading the content
function stopReading() {
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();
}


// Add an event listener for the Enter key
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to stop form submission
        sendMessage();
    }
});


// Recoding Widgets
document.getElementById("startRecord").style.display = "inline-block";
document.getElementById("stopRecord").style.display = "none";
document.getElementById("startRecord").onclick = startRecording;
document.getElementById("stopRecord").onclick = stopRecording;
document.addEventListener("keydown", handleKeyDown);
let mediaRecorder;
let audioChunks = [];

