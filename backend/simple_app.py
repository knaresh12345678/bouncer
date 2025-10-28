#!/usr/bin/env python3
"""
Simple FastAPI app for login testing with OTP password reset and SMS verification
"""
from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from passlib.context import CryptContext
import jwt
import random
import smtplib
import requests
import os
from typing import Optional, Dict
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta, timezone
import pytz
try:
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
except ImportError:
    # Fallback for older Python versions
    from email.mime.text import MIMEText as MimeText
    from email.mime.multipart import MIMEMultipart as MimeMultipart

# Create FastAPI app
app = FastAPI(title="Simple Login API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"

# Email configuration (for development, we'll simulate email sending)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "bouncer.app.test@gmail.com",  # Replace with your email
    "sender_password": "your-app-password",        # Replace with your app password
    "development_mode": True  # Set to False to send real emails
}

# OTP storage (in production, use Redis or database)
otp_storage = {}

# SMS/Phone OTP storage
phone_otp_storage = {}

# Twilio configuration (for SMS OTP)
TWILIO_CONFIG = {
    "account_sid": os.getenv("TWILIO_ACCOUNT_SID", ""),  # Get from environment variables
    "auth_token": os.getenv("TWILIO_AUTH_TOKEN", ""),    # Get from environment variables
    "from_number": os.getenv("TWILIO_FROM_NUMBER", ""),  # Your Twilio phone number
    "development_mode": os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"  # Read from env
}

# Firebase configuration (alternative to Twilio)
FIREBASE_CONFIG = {
    "api_key": os.getenv("FIREBASE_API_KEY", ""),
    "project_id": os.getenv("FIREBASE_PROJECT_ID", ""),
    "development_mode": os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"
}

# Fast2SMS configuration (India-specific alternative)
FAST2SMS_CONFIG = {
    "api_key": os.getenv("FAST2SMS_API_KEY", ""),
    "sender_id": os.getenv("FAST2SMS_SENDER_ID", "FSTSMS"),
    "development_mode": os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"
}

# Pydantic models for OTP requests
class SendOtpRequest(BaseModel):
    phone_number: str

class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str
    session_id: str

def generate_otp():
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

def store_otp(email: str, otp: str):
    """Store OTP with expiry time (10 minutes)"""
    expiry_time = datetime.now(pytz.UTC) + timedelta(minutes=10)
    otp_storage[email] = {
        "otp": otp,
        "expiry": expiry_time,
        "attempts": 0
    }

def verify_otp(email: str, otp: str) -> bool:
    """Verify OTP"""
    if email not in otp_storage:
        return False

    stored_data = otp_storage[email]

    # Check expiry
    if datetime.now(pytz.UTC) > stored_data["expiry"]:
        del otp_storage[email]
        return False

    # Check attempts (max 3)
    if stored_data["attempts"] >= 3:
        del otp_storage[email]
        return False

    # Verify OTP
    if stored_data["otp"] == otp:
        del otp_storage[email]  # Remove OTP after successful verification
        return True
    else:
        stored_data["attempts"] += 1
        return False

def send_reset_email(email: str, otp: str):
    """Send password reset email (simulated for development)"""
    if EMAIL_CONFIG["development_mode"]:
        # For development, print to console instead of sending real email
        print(f"\n{'='*50}")
        print(f"PASSWORD RESET OTP")
        print(f"{'='*50}")
        print(f"Email: {email}")
        print(f"OTP: {otp}")
        print(f"Valid for: 10 minutes")
        print(f"{'='*50}\n")
        return True

    # Real email sending code (for production)
    try:
        msg = MimeMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        msg['To'] = email
        msg['Subject'] = "Password Reset OTP - Bouncer App"

        body = f"""
        <h2>[LOCK] Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for the Bouncer App.</p>
        <p><strong>Your OTP code is: {otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Bouncer App Team</p>
        """

        msg.attach(MimeText(body, 'html'))

        server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
        server.starttls()
        server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG["sender_email"], email, text)
        server.quit()

        return True
    except Exception as e:
        print(f"Email sending error: {e}")
        return False

# SMS OTP Functions
def store_phone_otp(phone_number: str, otp: str) -> str:
    """Store OTP for phone number with expiry time (10 minutes) and return session ID"""
    session_id = str(uuid.uuid4())
    expiry_time = datetime.now(pytz.UTC) + timedelta(minutes=10)

    phone_otp_storage[session_id] = {
        "phone_number": phone_number,
        "otp": otp,
        "expiry": expiry_time,
        "attempts": 0,
        "verified": False
    }

    return session_id

def verify_phone_otp(session_id: str, otp: str) -> bool:
    """Verify OTP for phone number"""
    if session_id not in phone_otp_storage:
        return False

    stored_data = phone_otp_storage[session_id]

    # Check expiry
    if datetime.now(pytz.UTC) > stored_data["expiry"]:
        del phone_otp_storage[session_id]
        return False

    # Check attempts (max 3)
    if stored_data["attempts"] >= 3:
        del phone_otp_storage[session_id]
        return False

    # Verify OTP
    if stored_data["otp"] == otp:
        stored_data["verified"] = True
        return True
    else:
        stored_data["attempts"] += 1
        return False

def send_sms_otp_twilio(phone_number: str, otp: str) -> dict:
    """Send OTP via SMS using Twilio with proper error handling"""
    try:
        print(f"[TWILIO] Attempting to send SMS to +{phone_number}")

        if not all([TWILIO_CONFIG["account_sid"], TWILIO_CONFIG["auth_token"], TWILIO_CONFIG["from_number"]]):
            error_msg = "Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER environment variables."
            print(f"[TWILIO ERROR] {error_msg}")
            return {"success": False, "error": error_msg, "provider": "twilio"}

        import twilio.rest
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException

        client = Client(TWILIO_CONFIG["account_sid"], TWILIO_CONFIG["auth_token"])

        # Add country code if not present
        if not phone_number.startswith('+'):
            phone_number = '+91' + phone_number  # Default to India

        message = client.messages.create(
            body=f"Bouncer App OTP: {otp}. Valid for 10 minutes. Do not share this code.",
            from_=TWILIO_CONFIG["from_number"],
            to=phone_number
        )

        success_msg = f"SMS sent successfully via Twilio. SID: {message.sid}"
        print(f"[TWILIO SUCCESS] {success_msg}")
        return {"success": True, "message": success_msg, "sid": message.sid, "provider": "twilio"}

    except TwilioRestException as e:
        error_msg = f"Twilio API error: {e}"
        print(f"[TWILIO ERROR] {error_msg}")
        return {"success": False, "error": error_msg, "code": e.code, "provider": "twilio"}
    except Exception as e:
        error_msg = f"Unexpected Twilio error: {str(e)}"
        print(f"[TWILIO ERROR] {error_msg}")
        return {"success": False, "error": error_msg, "provider": "twilio"}

def send_sms_otp_fast2sms(phone_number: str, otp: str) -> dict:
    """Send OTP via Fast2SMS (India-specific) with proper error handling"""
    try:
        print(f"[SEARCH] [FAST2SMS] Attempting to send SMS to {phone_number}")

        if not FAST2SMS_CONFIG["api_key"]:
            error_msg = "Fast2SMS API key missing. Please set FAST2SMS_API_KEY environment variable."
            print(f"[ERROR] [FAST2SMS] {error_msg}")
            return {"success": False, "error": error_msg, "provider": "fast2sms"}

        # Fast2SMS API implementation
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "authorization": FAST2SMS_CONFIG["api_key"],
            "sender_id": FAST2SMS_CONFIG["sender_id"],
            "message": f"[LOCK] Bouncer App OTP: {otp}. Valid for 10 minutes. Do not share this code.",
            "language": "english",
            "route": "v3",
            "numbers": phone_number,
        }

        response = requests.post(url, data=payload, timeout=10)
        response_data = response.json()

        if response.status_code == 200 and response_data.get("return"):
            success_msg = f"SMS sent successfully via Fast2SMS. Message ID: {response_data.get('message', 'N/A')}"
            print(f"[SUCCESS] [FAST2SMS] {success_msg}")
            return {"success": True, "message": success_msg, "response": response_data, "provider": "fast2sms"}
        else:
            error_msg = response_data.get("message", "Fast2SMS API error")
            print(f"[ERROR] [FAST2SMS] {error_msg}")
            return {"success": False, "error": error_msg, "response": response_data, "provider": "fast2sms"}

    except requests.exceptions.RequestException as e:
        error_msg = f"Fast2SMS network error: {str(e)}"
        print(f"[ERROR] [FAST2SMS] {error_msg}")
        return {"success": False, "error": error_msg, "provider": "fast2sms"}
    except Exception as e:
        error_msg = f"Unexpected Fast2SMS error: {str(e)}"
        print(f"[ERROR] [FAST2SMS] {error_msg}")
        return {"success": False, "error": error_msg, "provider": "fast2sms"}

def send_sms_otp_development(phone_number: str, otp: str) -> dict:
    """Development mode - print OTP to console"""
    print(f"\n{'='*60}")
    print(f"[PHONE] SMS OTP - DEVELOPMENT MODE")
    print(f"{'='*60}")
    print(f"Phone: +{phone_number}")
    print(f"OTP: {otp}")
    print(f"Valid for: 10 minutes")
    print(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    return {
        "success": True,
        "message": "OTP generated in development mode (console output)",
        "otp": otp,
        "provider": "development"
    }

def send_sms_otp(phone_number: str, otp: str) -> dict:
    """Send OTP via SMS with fallback providers"""
    print(f"[SMS] Starting SMS delivery process for +{phone_number}")

    # Check if we're in development mode
    if TWILIO_CONFIG["development_mode"]:
        return send_sms_otp_development(phone_number, otp)

    # Try Twilio first
    twilio_result = send_sms_otp_twilio(phone_number, otp)
    if twilio_result["success"]:
        return twilio_result

    print(f"[SMS] Twilio failed, trying Fast2SMS fallback...")

    # Try Fast2SMS as fallback
    fast2sms_result = send_sms_otp_fast2sms(phone_number, otp)
    if fast2sms_result["success"]:
        return fast2sms_result

    # All providers failed
    error_msg = "All SMS providers failed"
    print(f"[SMS ERROR] {error_msg}")
    return {
        "success": False,
        "error": error_msg,
        "twilio_error": twilio_result.get("error"),
        "fast2sms_error": fast2sms_result.get("error"),
        "provider": "none"
    }

def get_user_from_db(email: str):
    """Get user from database"""
    conn = sqlite3.connect("test_bouncer.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT users.id, users.email, users.password_hash, users.first_name,
               users.last_name, users.is_active, roles.name as role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = ?
    """, (email,))

    result = cursor.fetchone()
    conn.close()

    if result:
        return {
            "id": result[0],
            "email": result[1],
            "password_hash": result[2],
            "first_name": result[3],
            "last_name": result[4],
            "is_active": result[5],
            "role": result[6]
        }
    return None

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/")
async def root():
    return {"message": "Simple Login API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/auth/login")
async def login(username: str = Form(), password: str = Form()):
    """Simple login endpoint"""
    try:
        # Get user from database
        user = get_user_from_db(username)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        if not pwd_context.verify(password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(status_code=401, detail="Account is deactivated")

        # Create JWT token
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"]
        }

        access_token = create_access_token(token_data)
        refresh_token = create_access_token({"sub": user["id"]})  # Simple refresh token

        # Return successful response
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 1800,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "role": user["role"],
                "is_active": user["is_active"],
                "is_verified": True,
                "created_at": "2024-01-01T00:00:00"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def update_user_password(email: str, new_password: str):
    """Update user password in database"""
    try:
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Hash new password
        hashed_password = pwd_context.hash(new_password)

        # Update password
        cursor.execute("""
            UPDATE users
            SET password_hash = ?
            WHERE email = ?
        """, (hashed_password, email))

        conn.commit()
        conn.close()

        return True
    except Exception as e:
        print(f"Password update error: {e}")
        return False

@app.post("/api/auth/send-reset-otp")
async def send_reset_otp(email: str = Form(...)):
    """Send password reset OTP to user email"""
    try:
        # Check if user exists
        user = get_user_from_db(email)
        if not user:
            raise HTTPException(status_code=404, detail="No account found with this email address")

        # Generate and store OTP
        otp = generate_otp()
        store_otp(email, otp)

        # Send OTP email
        email_sent = send_reset_email(email, otp)

        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send OTP email")

        return {
            "message": "OTP sent successfully",
            "email": email,
            "development_otp": otp if EMAIL_CONFIG["development_mode"] else None
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Send OTP error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/register")
async def register_user(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form("")
):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = get_user_from_db(email)
        if existing_user:
            raise HTTPException(status_code=400, detail="An account with this email already exists")

        # Validate password length and complexity
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

        # Check for password complexity (at least one uppercase, one lowercase, and one number)
        if not any(c.islower() for c in password):
            raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in password):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in password):
            raise HTTPException(status_code=400, detail="Password must contain at least one number")

        # Hash password
        hashed_password = pwd_context.hash(password)

        # Insert new user into database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get the 'user' role ID
        cursor.execute("SELECT id FROM roles WHERE name = 'user'")
        role_result = cursor.fetchone()

        if not role_result:
            # Create 'user' role if it doesn't exist
            cursor.execute("INSERT INTO roles (name, description) VALUES ('user', 'Customer booking bouncer services')")
            cursor.execute("SELECT id FROM roles WHERE name = 'user'")
            role_result = cursor.fetchone()

        role_id = role_result[0]

        # Insert user
        cursor.execute("""
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, is_verified)
            VALUES (?, ?, ?, ?, ?, ?, 1, 1)
        """, (email, hashed_password, first_name, last_name, phone, role_id))

        conn.commit()
        conn.close()

        return {
            "message": "User registered successfully",
            "email": email,
            "first_name": first_name,
            "last_name": last_name
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/verify-reset-otp")
async def verify_reset_otp(
    email: str = Form(...),
    otp: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...)
):
    """Verify OTP and reset password"""
    try:
        # Check if passwords match
        if new_password != confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")

        # Validate password length and complexity
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

        # Check for password complexity (at least one uppercase, one lowercase, and one number)
        if not any(c.islower() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one number")

        # Verify OTP
        if not verify_otp(email, otp):
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        # Update password
        if not update_user_password(email, new_password):
            raise HTTPException(status_code=500, detail="Failed to update password")

        return {
            "message": "Password reset successfully",
            "email": email
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Verify OTP error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# SMS OTP Endpoints
@app.post("/api/auth/send-otp")
async def send_otp(request: SendOtpRequest):
    """Send OTP to phone number for verification with comprehensive error handling"""
    try:
        phone_number = request.phone_number

        print(f"[API] Received OTP request for phone: {phone_number}")

        # Validate phone number (should be 10 digits for Indian numbers)
        if not phone_number:
            error_msg = "Phone number is required"
            print(f"[API ERROR] {error_msg}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "MISSING_PHONE"})

        if len(phone_number) != 10 or not phone_number.isdigit():
            error_msg = "Phone number must be exactly 10 digits"
            print(f"[API ERROR] {error_msg}: {phone_number}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "INVALID_PHONE_FORMAT"})

        # Generate 6-digit OTP
        otp = generate_otp()
        print(f"[API] Generated OTP: {otp} for phone: {phone_number}")

        # Store OTP with session ID
        session_id = store_phone_otp(phone_number, otp)
        print(f"[API] Stored OTP with session ID: {session_id}")

        # Send OTP via SMS with enhanced error handling
        sms_result = send_sms_otp(phone_number, otp)

        if not sms_result["success"]:
            # Clean up OTP storage if SMS failed
            if session_id in phone_otp_storage:
                del phone_otp_storage[session_id]

            error_detail = {
                "error": "Failed to send OTP via SMS",
                "code": "SMS_SEND_FAILED",
                "provider_errors": sms_result.get("provider", "none"),
                "details": sms_result.get("error", "Unknown error")
            }
            print(f"[ERROR] [API] SMS failed: {error_detail}")
            raise HTTPException(status_code=500, detail=error_detail)

        success_response = {
            "status": "success",
            "message": "OTP sent successfully",
            "session_id": session_id,
            "phone_number": phone_number[-4:] + "****",  # Mask phone number
            "provider": sms_result.get("provider", "development"),
            "details": sms_result.get("message", "OTP sent"),
            "expires_in": 600  # 10 minutes in seconds
        }

        print(f"[SUCCESS] [API] OTP sent successfully: {success_response}")
        return success_response

    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Unexpected server error: {str(e)}"
        print(f"[CRITICAL] [API] {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        )

@app.post("/api/auth/verify-otp")
async def verify_otp(request: VerifyOtpRequest):
    """Verify OTP for phone number with comprehensive error handling"""
    try:
        session_id = request.session_id
        otp = request.otp
        phone_number = request.phone_number

        print(f"[LOCK] [API] Received OTP verification request")
        print(f"   Session ID: {session_id}")
        print(f"   Phone: {phone_number}")
        print(f"   OTP: {otp}")

        # Validate inputs
        if not session_id:
            error_msg = "Session ID is required"
            print(f"[ERROR] [API] {error_msg}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "MISSING_SESSION_ID"})

        if not otp:
            error_msg = "OTP is required"
            print(f"[ERROR] [API] {error_msg}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "MISSING_OTP"})

        if not phone_number:
            error_msg = "Phone number is required"
            print(f"[ERROR] [API] {error_msg}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "MISSING_PHONE"})

        if len(otp) != 6 or not otp.isdigit():
            error_msg = "OTP must be exactly 6 digits"
            print(f"[ERROR] [API] {error_msg}: {otp}")
            raise HTTPException(status_code=400, detail={"error": error_msg, "code": "INVALID_OTP_FORMAT"})

        # Verify OTP
        is_valid = verify_phone_otp(session_id, otp)

        if not is_valid:
            # Check if session still exists and get detailed error info
            if session_id in phone_otp_storage:
                session_data = phone_otp_storage[session_id]
                attempts_left = 3 - session_data["attempts"]

                # Check if expired
                if datetime.now(pytz.UTC) > session_data["expiry"]:
                    # Clean up expired session
                    del phone_otp_storage[session_id]
                    error_detail = {
                        "error": "OTP has expired",
                        "code": "OTP_EXPIRED",
                        "details": "Please request a new OTP"
                    }
                    print(f"[ERROR] [API] OTP expired for session: {session_id}")
                    raise HTTPException(status_code=400, detail=error_detail)

                # Check if max attempts reached
                if session_data["attempts"] >= 3:
                    # Clean up session after max attempts
                    del phone_otp_storage[session_id]
                    error_detail = {
                        "error": "Maximum attempts exceeded",
                        "code": "MAX_ATTEMPTS_EXCEEDED",
                        "details": "Please request a new OTP",
                        "attempts_used": 3
                    }
                    print(f"[ERROR] [API] Max attempts exceeded for session: {session_id}")
                    raise HTTPException(status_code=400, detail=error_detail)

                # Invalid OTP with attempts remaining
                error_detail = {
                    "error": f"Invalid OTP. {attempts_left} attempts remaining",
                    "code": "INVALID_OTP",
                    "attempts_left": attempts_left,
                    "attempts_used": session_data["attempts"]
                }
                print(f"[ERROR] [API] Invalid OTP. Attempts left: {attempts_left}")
                raise HTTPException(status_code=400, detail=error_detail)
            else:
                error_detail = {
                    "error": "Session expired or invalid",
                    "code": "SESSION_INVALID",
                    "details": "Please request a new OTP"
                }
                print(f"[ERROR] [API] Session not found: {session_id}")
                raise HTTPException(status_code=400, detail=error_detail)

        # Success response
        success_response = {
            "status": "success",
            "message": "OTP verified successfully",
            "phone_number": phone_number[-4:] + "****",
            "verified": True,
            "attempts_used": phone_otp_storage.get(session_id, {}).get("attempts", 0)
        }

        print(f"[SUCCESS] [API] OTP verified successfully: {success_response}")
        return success_response

    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Unexpected server error during OTP verification: {str(e)}"
        print(f"[CRITICAL] [API] {error_msg}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "code": "SERVER_ERROR",
                "details": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    print("Starting simple login server...")
    print("Available at: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)