IMAGE_NAME="tube-summarize:02"

# Command to run docker with gpus enabled, mount the folder Docs and use the interactivily the bash shell
docker run -it --gpus all  -v ${pwd}\Docs:/Docs -p 8888:8888  $IMAGE_NAME bash