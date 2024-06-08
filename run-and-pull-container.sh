#!/bin/bash
IMAGE_NAME="carlosdevresearch/tube-summarizer"

# Command to run docker with gpus enabled, mount the folder Docs and use the interactivily the bash shell
docker run --gpus all  -p 5000:5000  $IMAGE_NAME
