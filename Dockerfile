# Base Image
FROM ubuntu:22.04
SHELL ["/bin/bash", "-c"]

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    ca-certificates \
    software-properties-common \
    build-essential \
    wget \
    python3-pip \
    ffmpeg

RUN add-apt-repository ppa:graphics-drivers/ppa

# Install nvidia toolkit
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
RUN dpkg -i cuda-keyring_1.1-1_all.deb
RUN apt-get update
RUN apt-get -y install cuda-toolkit-12-5

# Install Python dependencies
RUN python3 -m pip install -U pip
RUN pip3 install jupyter notebook
RUN pip3 install torch torchvision torchaudio
RUN pip3 install --ignore-installed blinker
RUN pip3 install transformers soundfile librosa ollama Flask ffmpeg
RUN pip3 install pytube
RUN pip3 install -U openai-whisper

# Install ollama
RUN curl -fsSL https://ollama.com/install.sh | sh
RUN mkdir -p /var/log/ollama
RUN nohup ollama start &> /var/log/ollama/ollama.log & sleep 10 && ollama pull llama3
# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
# Ensure the entrypoint script is executable
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY ./App /App 
WORKDIR /App
RUN python3 whisper-first-run.py
EXPOSE 5000

# Set the entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
