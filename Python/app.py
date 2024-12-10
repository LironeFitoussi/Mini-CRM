import os
import time
import logging
import requests
from flask import Flask, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import boto3
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
from threading import Thread

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Flask app
app = Flask(__name__)

# Paths and settings
CHROME_PROFILE_PATH = "/home/ubuntu/.whatsapp-profile"  # Update this path
QR_CODE_IMAGE_PATH = "whatsapp_qr.png"

# AWS S3 Client
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)


class WhatsAppAutomation:
    @staticmethod
    def generate_qr_code_or_screenshot(driver):
        """Check login status, save QR code or full page screenshot accordingly."""
        try:
            # Check if the user is already logged in
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'span[aria-hidden="true"][data-icon="lock-small"]'))
            )
            # Already logged in, capture full page screenshot
            logged_in_screenshot = "logged_in_screenshot.png"
            driver.save_screenshot(logged_in_screenshot)
            logging.info("User already logged in. Captured full page screenshot.")
            return logged_in_screenshot, "logged_in"
        except Exception:
            # User not logged in, generate QR code
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, '//canvas[@aria-label="Scan this QR code to link a device!"]'))
                )
                qr_code_element = driver.find_element(By.XPATH, '//canvas[@aria-label="Scan this QR code to link a device!"]')
                qr_code_element.screenshot(QR_CODE_IMAGE_PATH)
                logging.info(f"QR code screenshot saved at {QR_CODE_IMAGE_PATH}.")
                return QR_CODE_IMAGE_PATH, "qr_code"
            except Exception as e:
                logging.warning(f"Failed to locate QR code: {str(e)}")
                return None, "error"

    @staticmethod
    def wait_for_login(driver):
        """Wait for the user to log in and then notify the server."""
        try:
            logging.info("Waiting for user login...")
            WebDriverWait(driver, 300).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'span[aria-hidden="true"][data-icon="lock-small"]'))
            )
            logging.info("User successfully logged in.")
            # Notify the success endpoint
            response = requests.post("http://localhost:5000/success-log", json={"status": "User logged in"})
            if response.status_code == 200:
                logging.info("Successfully notified success-log endpoint.")
            else:
                logging.error("Failed to notify success-log endpoint.")
        except Exception as e:
            logging.error(f"Error waiting for login: {str(e)}")


class ImageUploader:
    @staticmethod
    def upload_image_to_s3(file_path, bucket_name):
        """Upload an image file to AWS S3."""
        try:
            file_name = os.path.basename(file_path)
            s3.upload_file(
                file_path,
                bucket_name,
                file_name,
                ExtraArgs={"ContentType": "image/png"},
            )
            file_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{file_name}"
            logging.info(f"Image uploaded to S3: {file_url}")
            return file_url
        except NoCredentialsError:
            logging.error("AWS credentials not found.")
            return None
        except Exception as e:
            logging.error(f"Failed to upload image to S3: {str(e)}")
            return None


def start_webdriver():
    """Start a WebDriver instance with a persistent user profile."""
    chrome_options = Options()
    chrome_options.add_argument(f"--user-data-dir={CHROME_PROFILE_PATH}")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    # Uncomment for headless mode
    # chrome_options.add_argument("--headless")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    return driver


@app.route("/get-qr-code", methods=["GET"])
def get_qr_code():
    """Generate WhatsApp QR code or capture a screenshot if already logged in."""
    try:
        # Start WebDriver
        logging.info("Starting WebDriver.")
        driver = start_webdriver()
        driver.get("https://web.whatsapp.com")
        time.sleep(7)  # Wait for the page to load

        # Generate QR code or take a screenshot if already logged in
        file_path, status = WhatsAppAutomation.generate_qr_code_or_screenshot(driver)
        if not file_path:
            driver.quit()
            return jsonify({"error": "Failed to generate QR code or capture screenshot."}), 500

        # Upload image to S3
        bucket_name = os.getenv("AWS_BUCKET_NAME")
        file_url = ImageUploader.upload_image_to_s3(file_path, bucket_name)
        if not file_url:
            driver.quit()
            return jsonify({"error": "Failed to upload image to S3."}), 500

        # Start a separate thread to wait for login if a QR code was generated
        if status == "qr_code":
            login_thread = Thread(target=WhatsAppAutomation.wait_for_login, args=(driver,))
            login_thread.start()

        driver.quit()
        return jsonify({"message": "Process completed successfully.", "status": status, "url": file_url})

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An error occurred during the process."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
