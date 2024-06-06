import ollama
import os
import re
import json
from pytube import YouTube
from transformers import pipeline
import whisper

class Speech2Text:
    def __init__(self,model_name="openai/whisper-medium",device='cuda'):
        try:
            self.pipe = pipeline("automatic-speech-recognition", model="openai/whisper-tiny", device = 'cuda')
            #self.pipe = whisper.load_model('tiny')
        except:
            print("No cuda found, falling back to cpu")
            self.pipe = pipeline("automatic-speech-recognition", model="openai/whisper-tiny", device = 'cpu')
    
    def get_transcript(self,file_path):
        return self.pipe(file_path)['text']
        #return self.pipe.transcribe(file_path)['text']

class SLM:
    def __init__(self,model_name,):
        self.model_name=model_name
        self.audio_model = Speech2Text()
    
    def prompt(self,chat_history,stream):
        return ollama.chat(model=self.model_name,messages=chat_history,stream=stream)


    def get_youtube_video(self,url: str) -> str:
        """Download a YouTube video, transcribe the audio, and summarize the transcription."""
        # Download YouTube video
        yt = YouTube(url)
        video_title = yt.title  # Get the video title
        video_stream = yt.streams.filter(only_audio=True).first()
        output_file = video_stream.download(filename='video.mp4')
        base, ext = os.path.splitext(output_file)
        wav_file = base + '.wav'
        os.system(f'ffmpeg -i {output_file} {wav_file}')

        # Transcribe audio using Whisper
        transcription = self.audio_model.get_transcript(wav_file)
        os.remove('video.mp4')
        os.remove('video.wav')
        return video_title,transcription
        
    def check_for_videos(self,text):
        youtube_url_pattern = re.compile(r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w\-]+)')
        matches = youtube_url_pattern.findall(text)
        context = ""
        template = """
        Summarize the following video, be as concise as possible unless the user ask, extract some bullet points, you should answer with summary exclusively
        Transcription: {transcription}
        """
        for idx,match in enumerate(matches):
            video_title,transcription = self.get_youtube_video(match)
            prompt = [
            {'role': 'user', 'content': template.format(transcription=transcription)}
        ]
            summary = self.prompt(chat_history=prompt,stream=False)['message']['content']
            context+=f"Transcription of the Video #{idx}\nTitle of the video:{video_title}\nUrl of the video: {match}\nSummary of the video:\n{summary}\n\n"
        return context

    def chat(self,chat_history,stream):
        user_input = chat_history[-1]['content']
        context = self.check_for_videos(user_input)
        template = """
        You are a chatbot assistant, if provided the context might be transcription of youtube videos, when ask for the video refer to the transcription. The context might have more than one video, and they are of shape "Transcription of the Video #<index of video>\nTitle of the video:<video_title>\nUrl of the video: <url>\nSummary of the video:\n<summary>\n\n"
        Context:{context}\n
        User input: {user_input}
        """
        
        prompt ={'role': 'user', 'content': template.format(context=context,user_input=user_input)}
        chat_history[-1] = prompt
        with open('log.txt',"a") as f:
            f.write("Input to model:\n")
            f.write(str(chat_history))
        stream = self.prompt(chat_history=chat_history,stream=True)
        return stream