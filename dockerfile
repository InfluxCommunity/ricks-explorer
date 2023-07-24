# Use the latest Python runtime as a parent image
FROM python:latest

# Install any needed packages specified in requirements.txt
ADD ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD ./app /app

# Make port 5002 available to the world outside this container
EXPOSE 5002

# Run the app using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]
