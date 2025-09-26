# invoice_maker.py
import os
import sys
import logging
from time import sleep
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# ---------- Config ----------
TARGET_URL = "https://www.printavo.com/quotes"
ENV_PATH = os.path.expanduser("~/.config/printavo/.env")
HEADLESS = False  # set to False to watch the browser
PAGELOAD_TIMEOUT = 45
ELEMENT_TIMEOUT = 25

# ---------- Logging ----------
logger = logging.getLogger("printavo_login")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(handler)


def load_secrets():
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH)
        logger.info("Loaded env from %s", ENV_PATH)
    else:
        logger.warning("No .env found at %s (will fall back to process env)", ENV_PATH)

    email = os.getenv("PRINTAVO_EMAIL")
    password = os.getenv("PRINTAVO_PASSWORD")

    if not email or not password:
        raise SystemExit("Missing PRINTAVO_EMAIL or PRINTAVO_PASSWORD in environment.")
    return email, password


def build_driver():
    """
    Use Selenium Manager (built into Selenium 4.6+) to resolve the matching driver automatically.
    We point to the Chromium binary explicitly.
    """
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-blink-features=AutomationControlled")

    # Tell Selenium to use your system Chromium binary
    opts.binary_location = "/usr/bin/chromium-browser"

    # Selenium Manager will fetch the right chromedriver automatically
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(PAGELOAD_TIMEOUT)
    return driver


def wait_for_quotes(driver):
    WebDriverWait(driver, ELEMENT_TIMEOUT).until(EC.url_contains("/quotes"))
    possible_locators = [
        (By.CSS_SELECTOR, "h1, h2, h3"),
        (By.CSS_SELECTOR, "table, [role='table'], .table"),
        (By.CSS_SELECTOR, "[data-controller*='quotes'], [data-controller*='invoices']")
    ]
    for by, sel in possible_locators:
        try:
            WebDriverWait(driver, 5).until(EC.presence_of_element_located((by, sel)))
            return
        except TimeoutException:
            continue
    sleep(1)


def do_login(driver, email, password):
    logger.info("Navigating to %s", TARGET_URL)
    driver.get(TARGET_URL)

    # If already logged in, we should land on /quotes quickly
    try:
        wait_for_quotes(driver)
        logger.info("Already logged in; on Quotes page.")
        return
    except TimeoutException:
        pass

    # Look for login form fields (IDs from your screenshots)
    try:
        email_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.ID, "user_email"))
        )
        pwd_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.ID, "user_password"))
        )
        logger.info("Login form located.")
    except TimeoutException:
        logger.warning("ID-based login fields not found; trying fallback selectors.")
        email_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='user[email]']"))
        )
        pwd_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='user[password]']"))
        )

    email_input.clear(); email_input.send_keys(email)
    pwd_input.clear();   pwd_input.send_keys(password)

    # Click Login button
    try:
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit'][value='Login']")
    except NoSuchElementException:
        login_btn = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login' or @type='submit'] | //input[@type='submit']"))
        )

    logger.info("Submitting login…")
    login_btn.click()

    # Wait for redirect to a signed-in page
    WebDriverWait(driver, PAGELOAD_TIMEOUT).until(EC.any_of(
        EC.url_contains("/quotes"),
        EC.url_contains("/invoices"),
        EC.url_contains("/dashboard")
    ))

    wait_for_quotes(driver)
    logger.info("Login successful; now on Quotes.")


def main():
    email, password = load_secrets()
    try:
        driver = build_driver()
    except WebDriverException as e:
        logger.error("Failed to start Chrome driver: %s", e)
        raise

    try:
        do_login(driver, email, password)
        logger.info("Ready for next steps (create invoice, etc.).")
        if not HEADLESS:
            sleep(3)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
