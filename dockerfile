# Use the latest Python runtime as a parent image
FROM python:latest

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD ./app /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5002 available to the world outside this container
EXPOSE 5002

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]
