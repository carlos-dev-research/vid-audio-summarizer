from helper_functions.helper_functions import *
from models import *
from flask import Flask, render_template, jsonify, request, Response,stream_with_context 
from werkzeug.utils import secure_filename
import json

# Load models
slm = SLM(model_name='llama3')

# Create Web App
app = Flask(__name__)

# Main Endpoint
@app.route("/")
def home():
    session_id = create_sessionId()
    delete_old_sessions('chat_history') # Filepath to directory where the chats are saved
    return render_template('chat.html',session_id=session_id) # Return HTML Template

# Upload Audio Endpoint
@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    # Get Audio from Response
    if 'audioFile' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['audioFile']
    filename = secure_filename(file.filename)
    if not filename.endswith('.wav'):
        filename += '.wav'  # Ensure the file has the correct extension
    file_path = os.path.join('uploaded_audios', filename)
    file.save(file_path)

    # Process the audio
    transcription = slm.audio_model.get_transcript(file_path)
    return jsonify ({'transcription':transcription})

@app.route('/stream-send', methods=['GET'])
def stream_send():
    text = request.args.get('text')  # Get text from query parameters
    session_id = request.args.get('session_id')
    chat_history = get_chat_history(session_id)

    chat_history.append({'role': 'user', 'content': text}) # Append last prompt

    def generate():
        # Call Ollama with streaming enabled
        stream = slm.chat(chat_history=chat_history,stream=True)
        out=""
        for chunk in stream:
            out+= chunk['message']['content']
            data = json.dumps({"response": chunk['message']['content'], "endOfMessage": False})
            yield f"data:{data}\n\n"
         # Ensure the final message is also properly JSON encoded
        end_message = json.dumps({"endOfMessage": True})

        chat_history.append({'role': 'assistant', 'content': out}) # Append last response from the model
        
        save_chat_history(session_id,chat_history)

        yield f"data:{end_message}\n\n"

    return Response(stream_with_context(generate()), content_type='text/event-stream')

# Start the Flask application if this script is executed directly
if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000,debug=True)  # Enable debug mode for development purposes