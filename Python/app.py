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
    def generate_qr_code(driver):
        """Save QR code screenshot."""
        try:
            qr_code_element = driver.find_element(By.XPATH, '//canvas[@aria-label="Scan this QR code to link a device!"]')
            qr_code_element.screenshot(QR_CODE_IMAGE_PATH)
            logging.info(f"QR code screenshot saved at {QR_CODE_IMAGE_PATH}.")
            return QR_CODE_IMAGE_PATH
        except Exception as e:
            logging.error(f"Failed to capture QR code: {str(e)}")
            return None

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


@app.route("/get-qr-code", methods=["GET"])
def get_qr_code():
    """Generate WhatsApp QR code, upload it to S3, and wait for user login."""
    try:
        # Start WebDriver
        logging.info("Starting WebDriver.")
        chrome_options = Options()
        # chrome_options.add_argument("--headless")  # Uncomment for headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.get("https://web.whatsapp.com")
        time.sleep(7)  # Wait for QR code to load

        # Capture QR code
        qr_code_path = WhatsAppAutomation.generate_qr_code(driver)
        if not qr_code_path:
            driver.quit()
            return jsonify({"error": "Failed to generate QR code."}), 500

        # Upload QR code to S3
        bucket_name = os.getenv("AWS_BUCKET_NAME")
        file_url = ImageUploader.upload_image_to_s3(qr_code_path, bucket_name)
        if not file_url:
            driver.quit()
            return jsonify({"error": "Failed to upload QR code to S3."}), 500

        # Wait for login in a separate thread
        login_thread = Thread(target=WhatsAppAutomation.wait_for_login, args=(driver,))
        login_thread.start()

        return jsonify({"message": "QR code generated and uploaded successfully.", "url": file_url})

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An error occurred during the process."}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
