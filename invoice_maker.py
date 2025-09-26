# invoice_maker.py (fast login version)
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
LOGIN_URL  = "https://www.printavo.com/users/sign_in"
TARGET_URL = "https://www.printavo.com/quotes"
ENV_PATH   = os.path.expanduser("~/.config/printavo/.env")

HEADLESS           = False  # set False to watch it
PAGELOAD_TIMEOUT   = 20    # lower for quicker fail
ELEMENT_TIMEOUT    = 8     # shorter, we “race” for elements
POST_LOGIN_TIMEOUT = 15    # allow a bit more for the redirect

# ---------- Logging ----------
logger = logging.getLogger("printavo_login_fast")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(handler)


def load_secrets():
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH)
        logger.info("Loaded env from %s", ENV_PATH)
    else:
        logger.warning("No .env found at %s (falling back to env)", ENV_PATH)

    email = os.getenv("PRINTAVO_EMAIL")
    password = os.getenv("PRINTAVO_PASSWORD")
    if not email or not password:
        raise SystemExit("Missing PRINTAVO_EMAIL or PRINTAVO_PASSWORD in environment.")
    return email, password


def build_driver():
    """
    Use Selenium Manager (built-in) + Chromium binary.
    Speed-ups:
      - pageLoadStrategy 'eager'
      - block images
      - headless=new
    """
    opts = Options()
    opts.page_load_strategy = "eager"
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    # Use system Chromium
    opts.binary_location = "/usr/bin/chromium-browser"
    # Block images to speed load
    prefs = {"profile.managed_default_content_settings.images": 2}
    opts.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(PAGELOAD_TIMEOUT)
    return driver


def on_signed_in_page(d):
    url = d.current_url
    return any(x in url for x in ("/quotes", "/invoices", "/dashboard"))


def wait_for_quotes(driver):
    WebDriverWait(driver, POST_LOGIN_TIMEOUT).until(EC.url_contains("/quotes"))
    # a small presence check just to be sure we’re “there”
    WebDriverWait(driver, 5).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "h1, h2, h3, table, [role='table'], .table")
        )
    )



def do_login(driver, email, password):
    # Go directly to the login page (faster than redirecting from /quotes)
    logger.info("Navigating to %s", LOGIN_URL)
    driver.get(LOGIN_URL)

    # Quick race: if we’re already logged in (cookies), we might get bounced away fast
    try:
        WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            lambda d: on_signed_in_page(d)
                      or (d.find_elements(By.ID, "user_email")
                          and d.find_elements(By.ID, "user_password"))
        )
    except TimeoutException:
        logger.warning("Neither login form nor signed-in page detected quickly; proceeding anyway.")

    # If we’re already signed in, go straight to quotes and return
    if on_signed_in_page(driver):
        logger.info("Session already authenticated; going to Quotes.")
        driver.get(TARGET_URL)
        wait_for_quotes(driver)
        logger.info("On Quotes.")
        return

    # Otherwise, fill the login form immediately
    try:
        email_input = driver.find_element(By.ID, "user_email")
        pwd_input   = driver.find_element(By.ID, "user_password")
        logger.info("Login form located quickly.")
    except NoSuchElementException:
        # Fallback selectors if IDs aren’t there
        logger.info("Falling back to generic selectors for login fields.")
        email_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='user[email]']"))
        )
        pwd_input = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='user[password]']"))
        )

    email_input.clear(); email_input.send_keys(email)
    pwd_input.clear();   pwd_input.send_keys(password)

    # Submit login (prefer button[type=submit])
    try:
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
    except NoSuchElementException:
        login_btn = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' or normalize-space()='Login'] | //input[@type='submit']"))
        )
    logger.info("Submitting login…")
    login_btn.click()

    # After login, go to Quotes explicitly (faster than waiting on default redirect)
    driver.get(TARGET_URL)
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
            sleep(2)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
