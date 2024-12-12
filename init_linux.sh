echo "Installing system dependencies..."
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y python3 python3-pip libnss3 xvfb unzip wget software-properties-common
sudo apt install python3.12-venv

# Install Chrome 131.0.6778.108
sudo apt-get install -y \
    libgbm-dev libnss3 libx11-xcb1 libxcomposite1 libxcursor1 libxi6 libxtst6 libxrandr2 \
    fonts-liberation libasound2 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0

# 1. Navigate to the project directory
echo "Navigating to the project directory..."
cd ./Python

# 2. Enter the Python virtual environment
echo "Activating the Python virtual environment..."
source ./.venv/bin/activate

# 3. Install the required packages from requirements.txt
echo "Installing the required packages..."
pip install -r requirements.txt

# 4. Run the Python script
echo "Running the Python script..."
python ./app_linux.py