# vid-audio-summarizer
Web User Chat Interface to Summarize Youtube Videos from Audio

## Overview
This project is for educational purposes to demonstrate the use of Ollama, Hugging Face, and models like phi3 and llama3. If you plan on using this project, you must comply with their respective licenses.

## Features
- Summarize Youtube videos using audio transcriptions
- Utilizes models from Ollama and Hugging Face such as phi3 and llama3
- Provides a web user chat interface for interaction
- From the input text it parses the youtube link, download the transcription and process it with the LLM

## Notes and Observations
- **Larger Context Windows:** The models are more likely to hallucinate with larger context windows.
- **Noisy Transcriptions:** When the video transcription contains noisy text, the model is more likely to hallucinate. For example, repetitive nonsensical words that are sometimes output by Whisper Tiny model with complicated text.
- **Context Retrieval Algorithms:** This model does not use other context retrieval algorithms, which might significantly improve model efficiency and performance.
- **Chunked Text Context:** Dividing text context into chunks and applying retrieval-augmented generation (RAG) algorithms instead of inputting the complete text would be an improvement.
- **Progressive Summarization:** Applying custom loops to summarize information progressively could help compress information and enable the LLM to produce better summaries.
- **Session Chat History:** Implementing chat history per session with an SQL database could improve the system, especially when different people are querying the system.

## Requirements
- **NVIDIA CUDA Toolkit:** https://developer.nvidia.com/cuda-downloads
- **NVIDIA Container Toolkit:** https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#configuration 
- **NVIDIA Drivers:** https://www.nvidia.com/Download/index.aspx?lang=en-us
- **Docker Runtime to build and run containers:** https://docs.docker.com/engine/install/

## Warnings
- **Accuracy:** Content generated by the LLM might be highly inaccurate.
- **Hallucination:** Large videos are more likely to result in hallucinations.
- **Educational Use Only:** The video and image content are not endorsed in any way and are just for educational purposes.

## Getting Started
### 1. Clone the Repository
```bash
git clone https://github.com/carlos-dev-research/vid-audio-summarizer.git
cd vid-audio-summarizer
```

### 2. Build Docker container
```bash
sudo bash build-docker.sh
```

### 3. Run Docker Container
```bash
sudo bash run-docker.sh
```

### 4. Model should now be running on port http://127.0.0.1:5000

## Samples
![sample1](https://github.com/carlos-dev-research/vid-audio-summarizer/assets/68810007/e78c41b1-4157-4204-9a32-c47d20c99cc7)
