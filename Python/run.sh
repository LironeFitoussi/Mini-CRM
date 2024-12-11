#!/bin/bash

# Exit on errors
set -e

# Update package list and install necessary system dependencies
echo "Installing system dependencies..."
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y python3 python3-pip libnss3 xvfb unzip wget software-properties-common
sudo apt install python3.12-venv

# Remove all existing pip packages
echo "Removing all existing pip packages..."
pip3 freeze > installed_packages.txt
pip3 uninstall -y -r installed_packages.txt
rm -f installed_packages.txt

# Upgrade pip to the latest version
echo "Upgrading pip..."
pip3 install --upgrade pip

# Create a Python virtual environment
echo "Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
source .venv/bin/activate

# Install Python dependencies from requirements.txt
echo "Installing Python dependencies in virtual environment..."
pip install --upgrade pip
pip install -r requirements.txt
pip install selenium pyvirtualdisplay webdriver-manager

# Ensure WebDriver dependencies are available
echo "Setting up WebDriver Manager and ChromeDriver..."
python -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"

# Install virtual display dependencies
echo "Installing virtual display dependencies..."
sudo apt install -y xvfb

# Check if Google Chrome is installed, and install it if not
if ! command -v google-chrome &> /dev/null
then
    echo "Google Chrome not found. Installing..."
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install -y ./google-chrome-stable_current_amd64.deb
    rm -f google-chrome-stable_current_amd64.deb
else
    echo "Google Chrome is already installed."
    google-chrome --version
fi

# Export Flask environment variables
export FLASK_APP=app.py
export FLASK_ENV=development

# Export DISPLAY for virtual display
export DISPLAY=:99.0

# Start the virtual display
echo "Starting virtual display..."
xvfb-run --auto-servernum --server-args='-screen 0 1024x768x24' bash -c "
    echo 'Starting Flask server...';
    python -m flask run --host=0.0.0.0 --port=5000
"

# Verify Selenium and WebDriver setup
echo "Testing Selenium setup..."
python3 - <<EOF
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
driver.get("https://www.google.com")
print("Title:", driver.title)
driver.quit()
EOF
