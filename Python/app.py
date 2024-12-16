import os
import time
import logging
import uuid
from datetime import datetime
import pyperclip
from bson.objectid import ObjectId
import requests
import pandas as pd
from selenium.webdriver.common.keys import Keys
from pymongo import MongoClient
from flask import Flask, jsonify, request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager, ChromeType
import boto3
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
from threading import Thread
from selenium.common.exceptions import TimeoutException
import phonenumbers
from phonenumbers import geocoder
from typing import Optional
from sys import platform
import subprocess
import sys


# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Flask app
app = Flask(__name__)

# MongoDB Connection
client = MongoClient(
    "mongodb+srv://lironefit:4YrMTTViFjGfG0yf@cluster0.e2j9t.mongodb.net/phone_data?retryWrites=true&w=majority&appName=Cluster0"
)
db = client.get_database("test")
valid_numbers_col = db.valid_numbers
invalid_numbers_col = db.invalid_numbers
messages_col = db.messages

# Ensure unique indexes to prevent duplicates
valid_numbers_col.create_index("phoneNumber", unique=True)
invalid_numbers_col.create_index("phoneNumber", unique=True)

# Paths and settings
QR_CODE_IMAGE_PATH = "whatsapp_qr.png"
PROFILE_DIRECTORY = "./chrome_profile"

if not os.path.exists(PROFILE_DIRECTORY):
    os.makedirs(PROFILE_DIRECTORY)

# AWS S3 Client
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

# STATIC STATUS
STATUS = {
    "status": "User not logged in",
    "message": "Please scan the QR code to log in.",
}

# Static Country Prefixes
COUNTRY_PREFIXES = {
    "212": "Morocco",
    "213": "Algeria",
    "216": "Tunisia",
    "218": "Libya",
    "225": "Ivory Coast",
    "590": "Guadeloupe",
    "393": "Italy",
    "31": "Netherlands",
    "1": "USA/Canada",
    "49": "Germany",
    "39": "Italy",
    "58": "Venezuela",
    "41": "Switzerland",
    "45": "Denmark",
    "46": "Sweden",
    "51": "Peru",
    "54": "Argentina",
    "55": "Brazil",
    "597": "Suriname",
    "598": "Uruguay",
}

# Logging directories (ensure these exist or create them)
IMAGE_SAVE_DIR = "uploaded_images"
SCREENSHOT_DIR = "screenshots"
LOGFILE = "send_messages.log"

if not os.path.exists(IMAGE_SAVE_DIR):
    os.makedirs(IMAGE_SAVE_DIR)

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)


def log_message(msg):
    with open(LOGFILE, "a") as f:
        f.write(f"{datetime.now()} - {msg}\n")


def check_chrome_version():
    """
    Attempt to get Chrome version across different platforms
    """
    try:
        if sys.platform == "win32":
            # Windows version check
            result = subprocess.run(
                [
                    "reg",
                    "query",
                    "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon",
                    "/v",
                    "version",
                ],
                capture_output=True,
                text=True,
            )
            version = result.stdout.split()[-1] if result.returncode == 0 else "Unknown"
        elif sys.platform == "darwin":
            # macOS version check
            result = subprocess.run(
                [
                    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                    "--version",
                ],
                capture_output=True,
                text=True,
            )
            version = result.stdout.strip() if result.returncode == 0 else "Unknown"
        else:
            # Linux version check
            result = subprocess.run(
                ["google-chrome", "--version"], capture_output=True, text=True
            )
            version = result.stdout.strip() if result.returncode == 0 else "Unknown"
        return version
    except Exception as e:
        logging.error(f"Could not determine Chrome version: {e}")
        return "Unable to determine"


def setup_driver():
    """
    Advanced WebDriver setup with extensive error handling and logging
    """
    logging.basicConfig(level=logging.INFO)

    try:
        # Check Chrome version
        chrome_version = check_chrome_version()
        logging.info(f"Detected Chrome Version: {chrome_version}")

        # Configure Chrome options
        chrome_options = Options()

        # User profile directory for session persistence
        chrome_options.add_argument(
            f"--user-data-dir={os.path.abspath(PROFILE_DIRECTORY)}"
        )

        # Optional: Specify a particular profile within the user-data-dir
        # chrome_options.add_argument("--profile-directory=Default")

        # Aggressive troubleshooting options
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--verbose")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

        # Optional: Uncomment to debug
        # chrome_options.add_argument("--remote-debugging-port=9222")

        try:
            # Use ChromeDriverManager with specific Chrome type
            service = Service(
                ChromeDriverManager(chrome_type=ChromeType.GOOGLE).install()
            )

            # Initialize the WebDriver with extended timeout
            driver = webdriver.Chrome(service=service, options=chrome_options)

            return driver

        except Exception as detailed_error:
            logging.error(f"WebDriver Initialization Failed: {detailed_error}")
            logging.error(f"Detailed Error Type: {type(detailed_error)}")
            raise

    except Exception as general_error:
        logging.error(f"Setup Error: {general_error}")
        raise

# Define helper function outside of the route so the thread can access it
def input_multiline_text(input_element, message):
    pyperclip.copy(message)
    input_element.send_keys(Keys.CONTROL, 'v')

# On App Start, Open Browser to Get Status of WhatsApp
def init_load():
    # Step 1: Start WebDriver
    logging.info("Starting WebDriver.")

    driver = setup_driver()
    driver.get("https://web.whatsapp.com")

    # Step 2: Check if User is Logged In
    try:
        logging.info("Checking if user is logged in...")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.XPATH, "//span[@data-icon='lock-small']")
            )
        )
        logging.info("User is logged in.")
        STATUS["status"] = "User logged in"
        STATUS["message"] = "User is logged in."
    except Exception as e:
        logging.info("User is not logged in.")
        STATUS["status"] = "User not logged in"
        STATUS["message"] = "Please scan the QR code to log in."
    finally:
        driver.quit()

init_load()

# Phone Number Class
class PhoneNumber:
    @staticmethod
    def normalize_phone_number(phone_str: str) -> Optional[str]:
        """
        Attempt to normalize a phone number string to E.164 format.
        Returns None if the phone number is invalid.
        """
        print(phone_str)
        if not phone_str:
            return None
        if any(char in phone_str for char in ["%", "&"]):
            return None

        # if last 2 characters are ".0" then remove them
        if phone_str[-2:] == ".0":
            phone_str = phone_str[:-2]
        for ch in [".", "-", " "]:
            phone_str = phone_str.replace(ch, "")
        phone_str = phone_str.lstrip("p:+")
        if "/" in phone_str:
            phone_str = phone_str.split("/")[0]
        if phone_str.startswith(("O6", "O7", "06", "07")):
            phone_str = "33" + phone_str[1:]
        elif (phone_str.startswith("6") or phone_str.startswith("7")) and len(
            phone_str
        ) == 9:
            phone_str = "33" + phone_str
        elif (
            phone_str.startswith("50")
            or phone_str.startswith("51")
            or phone_str.startswith("52")
            or phone_str.startswith("53")
            or phone_str.startswith("54")
            or phone_str.startswith("55")
            or phone_str.startswith("58")
            and len(phone_str) == 9
        ):
            phone_str = "972" + phone_str
        elif phone_str.startswith("9726"):
            phone_str = "336" + phone_str[4:]
        elif phone_str.startswith("330"):
            phone_str = "33" + phone_str[3:]

        print(phone_str)
        # Check if the phone number is all digits
        if phone_str.isdigit():
            return phone_str
        else:
            print(f"Invalid Phone Number: {phone_str}")
            return None

    # Phone Column Class Detection
    @staticmethod
    def detect_phone_column(df):
        """
        Automatically detect the column that likely contains phone numbers.
        Checks only the first three rows of the DataFrame.
        """
        sample_df = df.head(3)
        for col in sample_df.columns:
            col_values = sample_df[col].astype(str)
            # print(col_values)
            # Check if some values in the sample start with '+' (likely international format)
            if col_values.str.startswith("+").any() and col_values.str.len().mean() > 9:
                return col
            # Check if all values in the sample are digits and long enough to be phone numbers
            if col_values.str.isdigit().all() and col_values.str.len().mean() > 9:
                return col
            # Check for known country prefixes
            for prefix in COUNTRY_PREFIXES:
                if col_values.str.startswith(prefix).all():
                    return col
        return None

    # Infer Country Code
    @staticmethod
    def infer_country_from_phone(phone_number: str) -> str:
        parse_number = "+" + phone_number
        try:
            parsed = phonenumbers.parse(parse_number, None)
            if not phonenumbers.is_possible_number(
                parsed
            ) or not phonenumbers.is_valid_number(parsed):
                return ""
            return geocoder.description_for_number(parsed, "en") or ""
        except phonenumbers.NumberParseException:
            return ""

    # Guess Country Code
    @staticmethod
    def guess_country_from_prefix(phone: str) -> str:
        if phone.startswith("393") and len(phone) == 12:
            return "Italy"
        for prefix in sorted(COUNTRY_PREFIXES.keys(), key=len, reverse=True):
            if phone.startswith(prefix):
                return COUNTRY_PREFIXES[prefix]
        return "Unknown"

# Image Uploader Class
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

# WhatsApp Automation Class
class WhatsAppAutomation:
    @staticmethod
    def generate_qr_code(driver):
        """Save QR code screenshot, or capture full page if QR code is not found."""
        try:
            # Wait for the QR code canvas to be present
            WebDriverWait(driver, 30).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        '//canvas[@aria-label="Scan this QR code to link a device!"]',
                    )
                )
            )
            qr_code_element = driver.find_element(
                By.XPATH, '//canvas[@aria-label="Scan this QR code to link a device!"]'
            )
            qr_code_element.screenshot(QR_CODE_IMAGE_PATH)
            logging.info(f"QR code screenshot saved at {QR_CODE_IMAGE_PATH}.")
            return QR_CODE_IMAGE_PATH

        except Exception as e:
            logging.warning(
                f"QR code element not found. Capturing full page instead: {str(e)}"
            )
            # Fallback to full-page screenshot
            fallback_screenshot_path = "fallback_page_screenshot.png"
            try:
                driver.save_screenshot(fallback_screenshot_path)
                logging.info(
                    f"Full page screenshot saved at {fallback_screenshot_path}."
                )
                return fallback_screenshot_path  # Return fallback screenshot path
            except Exception as screenshot_error:
                logging.error(
                    f"Failed to capture full page screenshot: {str(screenshot_error)}"
                )
                return None  # Return None if both attempts fail

    @staticmethod
    def wait_for_login(driver):
        """Wait for the user to log in and then notify the server."""
        try:
            logging.info("Waiting for user login...")
            WebDriverWait(driver, 120).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//span[@data-icon='lock-small']")
                )
            )

            # in case of unfound element, try to refresh the page
            driver.refresh()
            time.sleep(5)
            WebDriverWait(driver, 60).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//span[@data-icon='lock-small']")
                )
            )

            logging.info("User successfully logged in.")
            # Update the status
            STATUS["status"] = "User logged in"
            STATUS["message"] = "User is logged in."

            # Notify the success endpoint
            response = requests.post(
                "https://mini-crm-y7v9.onrender.com/api/success-log",
                json={"status": "User logged in"},
            )
            if response.status_code == 200:
                logging.info("Successfully notified success-log endpoint.")
            else:
                logging.error("Failed to notify success-log endpoint.")
            driver.quit()
        except Exception as e:
            logging.error(f"Error waiting for login: {str(e)}")
            # Take a screenshot in case of failure
            screenshot_path = "login_failure_screenshot.png"
            try:
                driver.save_screenshot(screenshot_path)
                ImageUploader.upload_image_to_s3(
                    screenshot_path, os.getenv("AWS_BUCKET_NAME")
                )

                # Notify the failure endpoint
                logging.info(
                    f"Screenshot saved at {screenshot_path} and uploaded to S3."
                )
                driver.quit()
            except Exception as screenshot_error:
                logging.error(f"Failed to capture screenshot: {str(screenshot_error)}")


@app.route("/get-qr-code", methods=["GET"])
def get_qr_code():
    """Generate WhatsApp QR code, upload it to S3, and wait for user login."""
    print("Generating QR code...")
    try:
        # before starting the WebDriver, check if there is a logged in user
        if STATUS["status"] == "User logged in":
            return jsonify({"message": "User is already logged in."})

        # Start WebDriver
        logging.info("Starting WebDriver.")
        driver = setup_driver()
        driver.get("https://web.whatsapp.com")
        time.sleep(7)  # Wait for QR code to load

        # Capture QR code or fallback screenshot
        qr_code_path = WhatsAppAutomation.generate_qr_code(driver)
        if not qr_code_path or qr_code_path == "fallback_page_screenshot.png":
            fallback_screenshot_path = qr_code_path
            driver.quit()
            file_url = ImageUploader.upload_image_to_s3(
                fallback_screenshot_path, os.getenv("AWS_BUCKET_NAME")
            )
            return (
                jsonify(
                    {
                        "error": "Failed to generate QR code or fallback screenshot.",
                        "url": file_url,
                    }
                ),
                500,
            )

        # Upload screenshot to S3
        bucket_name = os.getenv("AWS_BUCKET_NAME")
        file_url = ImageUploader.upload_image_to_s3(qr_code_path, bucket_name)
        if not file_url:
            driver.quit()
            return jsonify({"error": "Failed to upload screenshot to S3."}), 500

        # Wait for login in a separate thread
        login_thread = Thread(target=WhatsAppAutomation.wait_for_login, args=(driver,))
        login_thread.start()

        return jsonify(
            {
                "message": "QR code or fallback screenshot uploaded successfully.",
                "url": file_url,
            }
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An error occurred during the process."}), 500


@app.route("/logout", methods=["POST"])
def logout():
    """Log out the user by deleting the profile directory."""

    # stop all running processes and threads of chrome and chromedriver or any other relevant process
    os.system("pkill -f chrome")
    os.system("pkill -f chromedriver")
    os.system("pkill -f Xvfb")
    os.system("pkill -f Xorg")

    # Delete the profile directory "./chrome_profile"
    def delete_profile_directory():
        if os.path.exists(PROFILE_DIRECTORY):
            print(f"Deleting profile directory: {PROFILE_DIRECTORY}")
            os.system(f"rm -rf {PROFILE_DIRECTORY}")
            return jsonify({"message": "User logged out."})
        else:
            return jsonify({"message": "User is already logged out."})

    delete_profile_directory()

    try:
        # Start WebDriver
        driver = setup_driver()
        driver.get("https://web.whatsapp.com")

        # Delete all cookies
        driver.delete_all_cookies()

        # Delete Entire Browsing Data
        driver.execute_script("window.localStorage.clear();")
        driver.execute_script("window.sessionStorage.clear();")
        driver.execute_script(
            "window.indexedDB.databases().then(dbs => { dbs.forEach(db => { indexedDB.deleteDatabase(db.name); }); });"
        )

        driver.quit()

        # Remove the Cached Driver at /root/.wdm/drivers/chromedriver/
        # os.system("rm -rf /root/.wdm/drivers/chromedriver/")

        # Remove the profile directory
        if os.path.exists(PROFILE_DIRECTORY):
            print(f"Deleting profile directory: {PROFILE_DIRECTORY}")
            os.system(f"rm -rf {PROFILE_DIRECTORY}")
            driver = setup_driver()
            driver.get("https://web.whatsapp.com")
            time.sleep(5)

            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located(
                        (
                            By.XPATH,
                            '//canvas[@aria-label="Scan this QR code to link a device!"]',
                        )
                    )
                )
                driver.quit()
            except Exception as e:
                driver.quit()
                return jsonify({"error": "Failed to log out the user."}), 500

            logging.info("User logged out.")
            STATUS["status"] = "User not logged in"
            STATUS["message"] = "Please scan the QR code to log in."
            return jsonify({"message": "User logged out."})
        else:
            return jsonify({"message": "User is already logged out."})
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An error occurred during the process."}), 500


@app.route("/status", methods=["GET"])
def get_status():
    """Get the current status of the WhatsApp user."""
    return jsonify(STATUS)


@app.route("/process", methods=["POST"])
def process_numbers():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    temp_file_path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)
    file.save(temp_file_path)

    try:
        df = pd.read_excel(temp_file_path)
        # print(df)
        phone_col = PhoneNumber.detect_phone_column(df)
        if not phone_col:
            return jsonify({"error": "No valid phone number column detected"}), 400

        # Fetch existing phone numbers from the database
        existing_valid_numbers = set(
            entry["phoneNumber"]
            for entry in valid_numbers_col.find({}, {"phoneNumber": 1})
        )
        existing_invalid_numbers = set(
            entry["phoneNumber"]
            for entry in invalid_numbers_col.find({}, {"phoneNumber": 1})
        )

        processed_numbers = set()
        valid_entries = []
        invalid_entries = []

        for _, row in df.iterrows():
            raw_phone = str(row[phone_col]).strip()

            # Skip rows with 'nan' or empty phone numbers
            if raw_phone.lower() in {"nan", "", "none"}:
                print("Skipping empty phone number")
                continue

            normalized = PhoneNumber.normalize_phone_number(raw_phone)

            if normalized and normalized not in processed_numbers:
                processed_numbers.add(normalized)

                # Skip duplicates in both valid and invalid collections
                if (
                    normalized in existing_valid_numbers
                    or normalized in existing_invalid_numbers
                ):
                    continue

                country = PhoneNumber.infer_country_from_phone(
                    normalized
                ) or PhoneNumber.guess_country_from_prefix(normalized)
                if country and country != "Unknown":
                    valid_entries.append(
                        {
                            "phoneNumber": normalized,
                            "country": country,
                            "is_whatsapp": "unknown",  # Set initial status to unknown
                        }
                    )
                    existing_valid_numbers.add(normalized)
                else:
                    # Only add to invalid_entries if not already in invalid numbers
                    raw_phone_processed = (
                        PhoneNumber.normalize_phone_number(raw_phone) or raw_phone
                    )
                    if raw_phone_processed not in existing_invalid_numbers:
                        invalid_entries.append(
                            {
                                "phoneNumber": raw_phone_processed,
                                "reason": "No country detected",
                            }
                        )
                        existing_invalid_numbers.add(raw_phone_processed)
            elif not normalized:
                # Similarly, prevent duplicate invalid entries
                raw_phone_processed = (
                    PhoneNumber.normalize_phone_number(raw_phone) or raw_phone
                )
                if raw_phone_processed not in existing_invalid_numbers:
                    invalid_entries.append(
                        {"phoneNumber": raw_phone_processed, "reason": "Invalid format"}
                    )
                    existing_invalid_numbers.add(raw_phone_processed)

        # Insert valid and invalid entries in bulk
        if valid_entries:
            try:
                valid_numbers_col.insert_many(valid_entries, ordered=False)
            except Exception as e:
                return (
                    jsonify(
                        {"error": "Error inserting valid entries", "details": str(e)}
                    ),
                    500,
                )

        if invalid_entries:
            try:
                invalid_numbers_col.insert_many(invalid_entries, ordered=False)
            except Exception as e:
                return (
                    jsonify(
                        {"error": "Error inserting invalid entries", "details": str(e)}
                    ),
                    500,
                )

        # Get updated counts
        valid_count = valid_numbers_col.count_documents({})
        invalid_count = invalid_numbers_col.count_documents({})

        return (
            jsonify(
                {
                    "message": "Processing completed",
                    "new_valid_count": len(valid_entries),
                    "new_invalid_count": len(invalid_entries),
                    "total_valid_count": valid_count,
                    "total_invalid_count": invalid_count,
                }
            ),
            200,
        )
    finally:
        os.remove(temp_file_path)

@app.route("/validate", methods=["POST"])
def validate_whatsapp_numbers():
    def background_validation():
        driver = None
        try:
            driver = setup_driver()

            # Fetch numbers where is_whatsapp is "unknown"
            to_validate = list(valid_numbers_col.find({"is_whatsapp": "unknown"}))

            # Reverse the list
            to_validate.reverse()

            validated_count = 0
            for entry in to_validate:
                phone_number = entry["phoneNumber"]
                url = f"https://web.whatsapp.com/send?phone={phone_number}"
                driver.get(url)

                try:
                    # Wait for either the valid conversation header or the invalid phone number message
                    element = WebDriverWait(driver, 30).until(
                        EC.any_of(
                            EC.presence_of_element_located(
                                (By.XPATH, "//header[@class='_amid']")
                            ),
                            EC.presence_of_element_located(
                                (
                                    By.XPATH,
                                    "//div[text()='Phone number shared via url is invalid.']",
                                )
                            ),
                        )
                    )

                    # Determine which element appeared
                    if element.tag_name == "header":
                        # Number is valid on WhatsApp
                        valid_numbers_col.update_one(
                            {"_id": entry["_id"]}, {"$set": {"is_whatsapp": True}}
                        )
                        print(f"Number {phone_number} is valid on WhatsApp")
                        validated_count += 1
                    elif element.tag_name == "div":
                        # Number is not valid on WhatsApp

                        valid_numbers_col.update_one(
                            {"_id": entry["_id"]}, {"$set": {"is_whatsapp": False}}
                        )
                        print(f"Number {phone_number} is not valid on WhatsApp")

                except TimeoutException:
                    # Handle case where neither element appears
                    valid_numbers_col.update_one(
                        {"_id": entry["_id"]}, {"$set": {"is_whatsapp": "unknown"}}
                    )
                    print(
                        f"Validation for number {phone_number} timed out. Status set to unknown."
                    )
                    driver.close()
                    time.sleep(60)

            print(
                {
                    "message": "WhatsApp validation completed",
                    "total_checked": len(to_validate),
                    "validated_count": validated_count,
                }
            )

        except Exception as e:
            print({"error": "Validation failed", "details": str(e)})

        finally:
            if driver:
                driver.quit()

    # Check if the user is logged in
    if STATUS["status"] == "User not logged in":
        return jsonify({"error": "User is not logged in"}), 400
    else:
        # Start the background validation in a new thread
        thread = Thread(target=background_validation)
        thread.start()

    # Immediate response to the client
    return (
        jsonify(
            {"message": "Scanning started, we will notify you when the job is done"}
        ),
        202,
    )

@app.route('/send', methods=['POST'])
def send_messages():
    # Check if an image is provided (multipart/form-data)
    image_path = None
    if 'image' in request.files:
        message = request.form.get("message", "")
        image_file = request.files['image']
    else:
        # If not multipart/form-data, assume JSON
        data = request.get_json(silent=True) or {}
        message = data.get("message", "")
        image_file = None

    if not message and image_file is None:
        return jsonify({"error": "Message content or image is required"}), 400

    # Save the image file now (within the request context) if one is provided
    if image_file:
        ext = os.path.splitext(image_file.filename)[1]
        if not ext:
            ext = ".png"
        image_filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(IMAGE_SAVE_DIR, image_filename)
        image_file.save(image_path)

    def send_messages_thread(message, image_path):
        driver = None
        try:
            log_message("Thread started for sending messages.")
            messages_col = db["messages"]
            valid_numbers_col = db["valid_numbers"]

            # Check if the message already exists in the database
            existing_message = messages_col.find_one({"message": message})
            sent_ids = [str(_id) for _id in existing_message.get("sent_ids", [])] if existing_message else []
            log_message(f"Existing message found: {bool(existing_message)}, sent_ids count: {len(sent_ids)}")

            # Fetch valid numbers that haven't received this message yet
            valid_numbers = valid_numbers_col.find({
                "_id": {"$nin": [ObjectId(_id) for _id in sent_ids]},
                "is_whatsapp": True
            })
            valid_numbers_list = list(valid_numbers)
            log_message(f"Found {len(valid_numbers_list)} recipients to send to.")

            if len(valid_numbers_list) == 0:
                log_message("No new recipients. All previously messaged.")
                requests.post("https://mini-crm-y7v9.onrender.com/api/notify-sendstatus", json={
                    "message": "All valid recipients have already received this message",
                    "total_sent": len(sent_ids),
                    "sent_ids": sent_ids
                })
                return

            # Initialize WebDriver
            log_message("Initializing WebDriver.")
            driver = setup_driver()
            log_message("WebDriver initialized.")
            send_count = 0

            for i, entry in enumerate(valid_numbers_list):
                recipient_id = str(entry["_id"])
                phone_number = entry["phoneNumber"]
                url = f"https://web.whatsapp.com/send?phone={phone_number}"
                log_message(f"Navigating to {url}")
                driver.get(url)

                try:
                    # Wait for the chat input box to load
                    chat_box = WebDriverWait(driver, 20).until(
                        EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true' and @role='textbox' and @aria-activedescendant='']"))
                    )
                    log_message(f"Chat interface loaded for {phone_number}")

                    if image_path:
                        # IMAGE + CAPTION FLOW
                        plus_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//span[@data-icon='plus']"))
                        )
                        plus_button.click()

                        photos_videos_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "(//span[normalize-space()='Photos & videos'])"))
                        )
                        photos_videos_button.click()

                        file_input = WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.XPATH, "//input[@accept='image/*,video/mp4,video/3gpp,video/quicktime']"))
                        )
                        file_input.send_keys(os.path.abspath(image_path))
                        log_message(f"Image selected for {phone_number}")

                        caption_box = WebDriverWait(driver, 20).until(
                            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Add a caption') or @aria-placeholder='Add a caption']"))
                        )
                        caption_input = caption_box.find_element(By.XPATH, ".//ancestor::div[@role='textbox']")
                        caption_input.click()
                        time.sleep(1)

                        # Type caption as multiline text
                        input_multiline_text(caption_input, message)

                        send_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//span[@data-icon='send']"))
                        )
                        send_button.click()

                        WebDriverWait(driver, 20).until(
                            EC.presence_of_element_located((By.XPATH, "//span[@aria-label=' Sent ']"))
                        )
                        log_message(f"Image message sent to {phone_number}")

                    else:
                        # TEXT-ONLY FLOW
                        chat_box.click()
                        time.sleep(1)

                        # Type message as multiline text
                        input_multiline_text(chat_box, message)

                        send_button = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Send']"))
                        )
                        send_button.click()

                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.XPATH, "//span[@aria-label=' Sent ']"))
                        )
                        log_message(f"Text message sent to {phone_number}")

                    sent_ids.append(recipient_id)
                    send_count += 1

                    # Notify progress every 100 messages or at the end
                    if (i + 1) % 100 == 0 or (i + 1) == len(valid_numbers_list):
                        log_message(f"Progress update: {send_count} messages sent so far.")
                        requests.post("https://mini-crm-y7v9.onrender.com/api/notify-sendstatus", json={
                            "message": f"Progress update: {send_count} messages sent",
                            "total_sent": send_count,
                            "sent_ids": sent_ids
                        })

                except TimeoutException as e:
                    error_msg = f"Failed to send message to {phone_number}: {str(e)}"
                    log_message(error_msg)
                    screenshot_path = os.path.join(SCREENSHOT_DIR, f"error_{phone_number}_{int(time.time())}.png")
                    driver.save_screenshot(screenshot_path)
                    requests.post("https://mini-crm-y7v9.onrender.com/api/bot-error", json={
                        "error": "Message sending failed",
                        "details": error_msg,
                        "screenshot": screenshot_path
                    })
                except Exception as e:
                    error_msg = f"Unexpected error for {phone_number}: {str(e)}"
                    log_message(error_msg)
                    screenshot_path = os.path.join(SCREENSHOT_DIR, f"error_{phone_number}_{int(time.time())}.png")
                    driver.save_screenshot(screenshot_path)
                    requests.post("https://mini-crm-y7v9.onrender.com/api/bot-error", json={
                        "error": "Message sending failed",
                        "details": error_msg,
                        "screenshot": screenshot_path
                    })

            # Update or insert the message record
            if existing_message:
                messages_col.update_one(
                    {"_id": existing_message["_id"]},
                    {"$set": {"sent_ids": sent_ids, "timestamp": datetime.today().strftime('%Y-%m-%d %H:%M:%S')}}
                )
            else:
                messages_col.insert_one({
                    "message": message,
                    "sent_ids": sent_ids,
                    "timestamp": datetime.today().strftime('%Y-%m-%d %H:%M:%S')
                })
            
            log_message("All messages sent successfully.")
            requests.post("https://mini-crm-y7v9.onrender.com/api/notify-sendstatus", json={
                "message": "All messages sent successfully",
                "total_sent": send_count,
                "sent_ids": sent_ids
            })
        
        except Exception as e:
            error_msg = f"General error in thread: {str(e)}"
            log_message(error_msg)
            if driver:
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"general_error_{int(time.time())}.png")
                driver.save_screenshot(screenshot_path)
                requests.post("https://mini-crm-y7v9.onrender.com/api/bot-error", json={
                    "error": "Message sending failed",
                    "details": error_msg,
                    "screenshot": screenshot_path
                })
        finally:
            if driver:
                driver.quit()
                log_message("WebDriver closed in thread.")

    # Start the background thread now that we have saved the file and have all data ready
    thread = Thread(target=send_messages_thread, args=(message, image_path))
    thread.start()

    return jsonify({"message": "Message sending process started"}), 202

# Send to a single number for testing
@app.route("/test-message", methods=["POST"])
def test_message():
    # Check if image is provided in multipart/form-data
    if "image" in request.files:
        # multipart/form-data request
        message = request.form.get("message", "")
        phone_number = request.form.get("phone_number", "")
        image_file = request.files["image"]
    else:
        # JSON request
        data = request.json
        phone_number = data.get("phone_number")
        message = data.get("message")
        image_file = None

    if not phone_number or (not message and image_file is None):
        return jsonify({"error": "Phone number and message or image are required"}), 400

    driver = None
    screenshot_path = "test_message_screenshot.png"
    try:
        # Initialize WebDriver
        driver = setup_driver()

        # Open the chat with the provided phone number
        url = f"https://web.whatsapp.com/send?phone={phone_number}"
        driver.get(url)

        # Wait for the chat interface to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//div[@contenteditable='true' and @role='textbox' and @aria-activedescendant='']",
                )
            )
        )

        if image_file:
            # IMAGE + CAPTION FLOW
            # Save the image locally
            if not os.path.exists(IMAGE_SAVE_DIR):
                os.makedirs(IMAGE_SAVE_DIR)

            ext = os.path.splitext(image_file.filename)[1]
            if not ext:
                ext = ".png"  # Default extension if none provided
            image_filename = f"{uuid.uuid4()}{ext}"
            image_path = os.path.join(IMAGE_SAVE_DIR, image_filename)
            image_file.save(image_path)

            # Click attachment (plus) button
            plus_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//span[@data-icon='plus']"))
            )
            plus_button.click()

            # Click "Photos & videos"
            photos_videos_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "(//span[normalize-space()='Photos & videos'])")
                )
            )
            photos_videos_button.click()

            # Wait for file input to appear and upload the image
            file_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//input[@accept='image/*,video/mp4,video/3gpp,video/quicktime']",
                    )
                )
            )
            file_input.send_keys(os.path.abspath(image_path))

            # Wait for the image preview and caption box
            caption_box = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//*[contains(text(), 'Add a caption') or @aria-placeholder='Add a caption']",
                    )
                )
            )

            # Find the actual editable caption field
            caption_input = caption_box.find_element(
                By.XPATH, ".//ancestor::div[@role='textbox']"
            )
            caption_input.click()
            time.sleep(1)

            # Type the message as multiline text into the caption field 
            input_multiline_text(caption_input, message)
            # Click send button
            send_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//span[@data-icon='send']"))
            )
            send_button.click()

            # Wait for the message to be sent
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//span[@aria-label=' Sent ']")
                )
            )

        else:
            # TEXT-ONLY FLOW (Revert to original logic)
            # Focus on the input box
            input_box = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//div[@contenteditable='true' and @role='textbox' and @aria-activedescendant='']",
                    )
                )
            )
            input_box.click()
            time.sleep(1)  # Small pause to ensure the input is focused

            # Send the message as multiline text with dedicated function
            input_multiline_text(input_box, message)

            # Wait for the send button and click it
            send_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Send']"))
            )
            send_button.click()

            # Wait for the message to be sent
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//span[@aria-label=' Sent ']")
                )
            )

        return jsonify({"message": "Message sent successfully"}), 200

    except Exception as e:
        try:
            if driver:
                driver.save_screenshot(screenshot_path)
            ImageUploader.upload_image_to_s3(
                screenshot_path, os.getenv("AWS_BUCKET_NAME")
            )
            screenshot_url = f"https://{os.getenv('AWS_BUCKET_NAME')}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{screenshot_path}"
            return (
                jsonify(
                    {
                        "error": "Failed to send message",
                        "details": str(e),
                        "screenshot_url": screenshot_url,
                    }
                ),
                500,
            )
        except Exception as screenshot_error:
            return jsonify({"error": "Failed to send message", "details": str(e)}), 500
    finally:
        if driver:
            driver.quit()

def main():
    try:
        driver = setup_driver()
        # # Test the driver
        # driver.get("https://www.google.com")
        # print("Successfully opened Google!")
        # driver.quit()
    except Exception as e:
        print(f"Driver test failed: {e}")


if __name__ == "__main__":
    # Run the app
    main()
    app.run(host="0.0.0.0", port=5000, debug=True)
