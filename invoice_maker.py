# invoice_maker.py
import os
import sys
import logging
from time import sleep
from pathlib import Path
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# ---------- Config ----------
LOGIN_URL       = "https://www.printavo.com/users/sign_in"
QUOTES_URL      = "https://www.printavo.com/quotes"
NEW_QUOTE_URL   = "https://www.printavo.com/invoices/new?quote=true"
ENV_PATH        = os.path.expanduser("~/.config/printavo/.env")

HEADLESS           = True   # set False to watch it work
PAGELOAD_TIMEOUT   = 30
ELEMENT_TIMEOUT    = 10
POST_LOGIN_TIMEOUT = 20

ARTIFACT_DIR = Path.home() / "Documents" / "Yatta" / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

# ---------- Logging ----------
logger = logging.getLogger("printavo_automation")
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
    Uses Selenium Manager (built into Selenium 4.6+) with your system Chromium binary.
    Extra flags to make headless stable with Snap Chromium.
    """
    opts = Options()
    # In headless, let the page fully load scripts (login pages rely on JS)
    opts.page_load_strategy = "normal"
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1366,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-setuid-sandbox")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_argument("--lang=en-US,en")
    # Normal desktop UA
    opts.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    )
    # Use system Chromium
    opts.binary_location = "/usr/bin/chromium-browser"

    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(PAGELOAD_TIMEOUT)

    # Hide webdriver flag
    try:
        driver.execute_cdp_cmd(
            "Page.addScriptToEvaluateOnNewDocument",
            {"source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"}
        )
    except Exception:
        pass

    return driver


def save_artifacts(driver, label):
    png_path = ARTIFACT_DIR / f"{label}.png"
    html_path = ARTIFACT_DIR / f"{label}.html"
    try:
        driver.save_screenshot(str(png_path))
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        logger.info("Saved artifacts: %s, %s", png_path, html_path)
    except Exception as e:
        logger.warning("Failed to save artifacts: %s", e)


def on_signed_in_page(d):
    try:
        url = d.current_url
    except Exception:
        return False
    return any(x in url for x in ("/quotes", "/invoices", "/dashboard"))


def wait_for_quotes(driver):
    WebDriverWait(driver, POST_LOGIN_TIMEOUT).until(EC.url_contains("/quotes"))
    WebDriverWait(driver, 6).until(
        EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "h1, h2, h3, table, [role='table'], .table")
        )
    )


def wait_for_login_form(driver, timeout=ELEMENT_TIMEOUT):
    """Wait for either the canonical IDs or name-based fallbacks."""
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") in ("interactive", "complete")
    )
    # Try fast by ID
    try:
        email = WebDriverWait(driver, 2).until(EC.presence_of_element_located((By.ID, "user_email")))
        pwd   = WebDriverWait(driver, 2).until(EC.presence_of_element_located((By.ID, "user_password")))
        return email, pwd
    except TimeoutException:
        pass
    # Fallback selectors
    email = WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='user[email]']"))
    )
    pwd = WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='user[password]']"))
    )
    return email, pwd


def do_login(driver, email, password):
    logger.info("Navigating to %s", LOGIN_URL)
    driver.get(LOGIN_URL)

    # Quick race: signed-in OR login form present
    try:
        WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            lambda d: on_signed_in_page(d)
                      or bool(d.find_elements(By.ID, "user_email"))
                      or bool(d.find_elements(By.CSS_SELECTOR, "input[type='email'], input[name='user[email]']"))
        )
    except TimeoutException:
        logger.warning("Login form not detected quickly; reloading login page once.")
        driver.get(LOGIN_URL)

    if on_signed_in_page(driver):
        logger.info("Session already authenticated; going to Quotes.")
        driver.get(QUOTES_URL)
        wait_for_quotes(driver)
        logger.info("On Quotes.")
        return

    try:
        email_input, pwd_input = wait_for_login_form(driver)
        logger.info("Login form located.")
    except TimeoutException:
        logger.error("Could not find login fields; saving artifacts.")
        save_artifacts(driver, "login_form_not_found")
        raise

    email_input.clear(); email_input.send_keys(email)
    pwd_input.clear();   pwd_input.send_keys(password)

    try:
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
    except NoSuchElementException:
        login_btn = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' or normalize-space()='Login'] | //input[@type='submit']"))
        )
    logger.info("Submitting login…")
    login_btn.click()

    # Be explicit: go to /quotes after login
    driver.get(QUOTES_URL)
    wait_for_quotes(driver)
    logger.info("Login successful; now on Quotes.")


def create_new_quote(driver):
    logger.info("Clicking the 'Create Quote' button...")
    btn = WebDriverWait(driver, ELEMENT_TIMEOUT).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a.menu-item[title='Create a new quote']"))
    )
    btn.click()
    # Explicit navigation avoids headless/turbo flake
    driver.get(NEW_QUOTE_URL)
    if not HEADLESS:
        sleep(2)  # small visual pause


def wait_for_new_quote_page(driver, timeout=POST_LOGIN_TIMEOUT):
    logger.info("Waiting for New Quote page to load...")

    # Make sure we’ve landed on the right URL
    WebDriverWait(driver, timeout).until(EC.url_contains("/invoices/new"))

    # Now wait for the "Save & finish" button to be clickable
    save_finish_btn = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "input.btn.btn-success[value='Save & finish']")
        )
    )

    logger.info("New Quote page is ready. 'Save & finish' is clickable.")
    return save_finish_btn


def main():
    email, password = load_secrets()
    try:
        driver = build_driver()
    except WebDriverException as e:
        logger.error("Failed to start Chrome driver: %s", e)
        raise

    try:
        do_login(driver, email, password)
        create_new_quote(driver)

        # Pause to confirm visually (optional)
        if not HEADLESS:
            sleep(2)

        # Wait until Save & finish is clickable
        save_btn = wait_for_new_quote_page(driver)

        # Example: click it (just to prove it works, remove later)
        # save_btn.click()

    finally:
        driver.quit()


if __name__ == "__main__":
    main()
