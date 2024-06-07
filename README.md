# vid-audio-summarizer
Web User Chat Interface to Summarize Youtube Videos from Audio

## Overview
This project is for educational purposes to demonstrate the use of Ollama, Hugging Face, and models like phi3 and llama3. If you plan on using this project, you must comply with their respective licenses.

## Features
- Summarize Youtube videos using audio transcriptions
- Utilizes models from Ollama and Hugging Face such as phi3 and llama3
- Provides a web user chat interface for interaction
- Parses the YouTube link from the input text, downloads the transcription, and processes it with the LLM.

## Notes and Observations
- **Larger Context Windows:** The models are more likely to hallucinate with larger context windows.
- **Noisy Transcriptions:** When the video transcription contains noisy text, the model is more likely to hallucinate. For example, repetitive nonsensical words that are sometimes output by Whisper Tiny model with complicated text.
- **Context Retrieval Algorithms:** This model does not use other context retrieval algorithms, which might significantly improve model efficiency and performance.
- **Chunked Text Context:** Dividing text context into chunks and applying retrieval-augmented generation (RAG) algorithms instead of inputting the complete text would be an improvement.
- **Progressive Summarization:** Applying custom loops to summarize information progressively could help compress information and enable the LLM to produce better summaries.
- **Session Chat History:** Implementing chat history per session with an SQL database could improve the system, especially when different people are querying the system.

## Prerequisites
- An NVIDIA GPU compatible with CUDA.
  
## Requirements
- **NVIDIA CUDA Toolkit:** [Download CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
- **NVIDIA Container Toolkit:** [Install NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#configuration)
- **NVIDIA Drivers:** [Download NVIDIA Drivers](https://www.nvidia.com/Download/index.aspx?lang=en-us)
- **Docker Runtime:** [Install Docker](https://docs.docker.com/engine/install/)

### If using Ubuntu 22 you can use the following
#### Install NVIDIA CUDA Toolkit
```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-5
```
#### Install NVIDIA Container Toolkit
```bash
# Install nvidia container toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
    && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update

sudo apt-get install -y nvidia-container-toolkit

sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```
#### Install Docker
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install dockek packages
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker run hello-world
```

## Warnings
- **Accuracy:** Content generated by the LLM might be highly inaccurate.
- **Hallucination:** Large videos are more likely to result in hallucinations.
- **Educational Use Only:** The video and image content are not endorsed in any way and are just for educational purposes.

## License
If you plan on using or distributing this project, you must also comply with the licenses of all dependencies and tools used in the project.

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
