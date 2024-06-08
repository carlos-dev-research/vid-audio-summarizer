#!/bin/bash

IMAGE_NAME="tube-summarizer:02"

# build docker image
docker build -t  $IMAGE_NAME .
