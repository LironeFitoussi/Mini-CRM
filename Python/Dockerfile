# Use Python 3.12 as the base image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed Python packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Install required tools, dependencies, and Chrome for Selenium
RUN apt-get update && \
    apt-get install -y wget unzip xvfb xclip xsel fonts-liberation libappindicator3-1 && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb && \
    apt-get clean

# # Download and set up the ChromeDriver
# RUN CHROMEDRIVER_VERSION=$(wget -qO- https://chromedriver.storage.googleapis.com/LATEST_RELEASE) && \
#     wget -q "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip" && \
#     unzip chromedriver_linux64.zip && \
#     rm chromedriver_linux64.zip && \
#     mv chromedriver /usr/local/bin/ && \
#     chmod +x /usr/local/bin/chromedriver

# Set up environment variables for Selenium
ENV DISPLAY=:99

# Command to run the Python application
CMD ["python", "app.py"]
