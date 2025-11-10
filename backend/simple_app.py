#!/usr/bin/env python3
"""
Simple FastAPI app for login testing with OTP password reset and SMS verification
"""
from fastapi import FastAPI, HTTPException, Form, Header
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
    # Set expiration to 24 hours for better user experience
    # In production, consider shorter expiration with refresh token rotation
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
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
        # IMPORTANT: Convert user ID to string - PyJWT requires 'sub' to be a string
        token_data = {
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }

        access_token = create_access_token(token_data)
        refresh_token = create_access_token({"sub": str(user["id"])})  # Simple refresh token

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
    phone: str = Form(""),
    user_type: str = Form("user")
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

        # Get the appropriate role ID based on user_type
        print(f"[BACKEND] Creating user with role: {user_type}")

        cursor.execute("SELECT id FROM roles WHERE name = ?", (user_type,))
        role_result = cursor.fetchone()

        if not role_result:
            # Create role if it doesn't exist
            role_descriptions = {
                'user': 'Customer booking bouncer services',
                'bouncer': 'Security professional providing services',
                'admin': 'System administrator'
            }
            description = role_descriptions.get(user_type, 'User role')
            cursor.execute("INSERT INTO roles (name, description) VALUES (?, ?)", (user_type, description))
            cursor.execute("SELECT id FROM roles WHERE name = ?", (user_type,))
            role_result = cursor.fetchone()

        role_id = role_result[0]
        print(f"[BACKEND] Assigned role ID: {role_id} for user_type: {user_type}")

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

# ==================== BOUNCER SERVICE PROFILES ====================

# Database schema for service profiles
def init_service_profiles_table():
    """Create service profiles table if it doesn't exist"""
    conn = sqlite3.connect("test_bouncer.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            profile_type TEXT NOT NULL CHECK(profile_type IN ('individual', 'group')),
            name TEXT,
            location TEXT,
            phone_number TEXT,
            photo_url TEXT,
            amount_per_hour REAL,
            group_name TEXT,
            group_photo_url TEXT,
            member_count INTEGER,
            members TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()

# Initialize the table
init_service_profiles_table()

class ServiceProfileCreate(BaseModel):
    profile_type: str
    name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    amount_per_hour: Optional[float] = None
    group_name: Optional[str] = None
    member_count: Optional[int] = None
    members: Optional[list] = None

class ServiceProfileUpdate(BaseModel):
    profile_type: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    amount_per_hour: Optional[float] = None
    group_name: Optional[str] = None
    member_count: Optional[int] = None
    members: Optional[list] = None
    is_active: Optional[bool] = None

class BookingRequestCreate(BaseModel):
    eventName: str
    location: str
    date: str
    time: str
    price: float
    description: Optional[str] = None
    bookType: str  # 'individual' or 'group'
    memberCount: Optional[int] = None

@app.post("/api/bookings/")
async def create_booking_request(booking: BookingRequestCreate, authorization: Optional[str] = Header(None, alias="Authorization")):
    """Create a new booking request from user"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Creating booking request")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Generate unique ID for booking
        booking_id = str(uuid.uuid4())

        # Parse date and time
        from datetime import datetime
        try:
            # Combine date and time into datetime
            datetime_str = f"{booking.date} {booking.time}"
            start_datetime = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
            # For now, assume 4 hour duration
            end_datetime = start_datetime + timedelta(hours=4)
        except ValueError:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid date or time format")

        # Calculate total amount (assuming price is per hour and 4 hour duration)
        hourly_rate = booking.price
        total_amount = hourly_rate * 4  # 4 hours default

        # For now, we'll create a booking request without assigning a bouncer
        # bouncer_id will be assigned later when bouncer accepts the request
        # Using a placeholder bouncer_id for now (will need to be updated when bouncer accepts)
        placeholder_bouncer_id = "00000000-0000-0000-0000-000000000000"

        # Insert booking into database
        cursor.execute("""
            INSERT INTO bookings (
                id, user_id, bouncer_id, event_name, event_description,
                event_location_address, start_datetime, end_datetime,
                hourly_rate, total_amount, special_requirements, status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (
            booking_id,
            user_id,
            placeholder_bouncer_id,  # Placeholder until bouncer accepts
            booking.eventName,
            booking.description or '',
            booking.location,
            start_datetime.isoformat(),
            end_datetime.isoformat(),
            hourly_rate,
            total_amount,
            f"Book Type: {booking.bookType}" + (f", Member Count: {booking.memberCount}" if booking.memberCount else ""),
            'pending'
        ))

        conn.commit()
        conn.close()

        print(f"[BOOKING] Created booking request {booking_id} for user {user_id}")

        return {
            "success": True,
            "message": "Booking request created successfully!",
            "booking_id": booking_id,
            "status": "pending"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error creating booking request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create booking request: {str(e)}")

@app.get("/api/bookings/user")
async def get_user_bookings(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get all bookings for the authenticated user"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Getting user bookings")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get all bookings for this user
        cursor.execute("""
            SELECT
                b.id, b.bouncer_id, b.event_name, b.event_description,
                b.event_location_address, b.start_datetime, b.end_datetime,
                b.hourly_rate, b.total_amount, b.special_requirements,
                b.status, b.created_at, b.updated_at
            FROM bookings b
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        """, (user_id,))

        bookings = []
        for row in cursor.fetchall():
            booking = {
                "id": row[0],
                "bouncer_id": row[1],
                "event_name": row[2],
                "event_description": row[3],
                "event_location": row[4],
                "start_datetime": row[5],
                "end_datetime": row[6],
                "hourly_rate": row[7],
                "total_amount": row[8],
                "special_requirements": row[9],
                "status": row[10],
                "created_at": row[11],
                "updated_at": row[12]
            }
            bookings.append(booking)

        conn.close()

        print(f"[BOOKING] Found {len(bookings)} bookings for user {user_id}")

        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching user bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookings: {str(e)}")

@app.get("/api/bookings/pending")
async def get_pending_bookings(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get all pending booking requests (for bouncers to view)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Getting pending booking requests")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get all pending bookings with user information
        cursor.execute("""
            SELECT
                b.id, b.user_id, b.event_name, b.event_description,
                b.event_location_address, b.start_datetime, b.end_datetime,
                b.hourly_rate, b.total_amount, b.special_requirements,
                b.status, b.created_at,
                u.first_name, u.last_name, u.email, u.phone
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = 'pending'
            ORDER BY b.created_at DESC
        """)

        bookings = []
        for row in cursor.fetchall():
            booking = {
                "id": row[0],
                "user_id": row[1],
                "event_name": row[2],
                "event_description": row[3],
                "event_location": row[4],
                "start_datetime": row[5],
                "end_datetime": row[6],
                "hourly_rate": row[7],
                "total_amount": row[8],
                "special_requirements": row[9],
                "status": row[10],
                "created_at": row[11],
                "user_info": {
                    "first_name": row[12] if row[12] else "Unknown",
                    "last_name": row[13] if row[13] else "",
                    "email": row[14] if row[14] else "N/A",
                    "phone": row[15] if row[15] else "N/A"
                }
            }
            bookings.append(booking)

        conn.close()

        print(f"[BOOKING] Found {len(bookings)} pending booking requests")
        if bookings:
            print(f"[BOOKING] Sample booking data: {bookings[0]}")

        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching pending bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending bookings: {str(e)}")

@app.get("/api/bookings/see-later")
async def get_see_later_bookings(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get all 'see later' booking requests (for bouncers to review deferred requests)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Getting see later booking requests")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get all see_later bookings with user information
        cursor.execute("""
            SELECT
                b.id, b.user_id, b.event_name, b.event_description,
                b.event_location_address, b.start_datetime, b.end_datetime,
                b.hourly_rate, b.total_amount, b.special_requirements,
                b.status, b.created_at, b.updated_at,
                u.first_name, u.last_name, u.email, u.phone
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = 'see_later'
            ORDER BY b.updated_at DESC
        """)

        bookings = []
        for row in cursor.fetchall():
            booking = {
                "id": row[0],
                "user_id": row[1],
                "event_name": row[2],
                "event_description": row[3],
                "event_location": row[4],
                "start_datetime": row[5],
                "end_datetime": row[6],
                "hourly_rate": row[7],
                "total_amount": row[8],
                "special_requirements": row[9],
                "status": row[10],
                "created_at": row[11],
                "deferred_at": row[12],  # updated_at timestamp when moved to see_later
                "user_info": {
                    "first_name": row[13] if row[13] else "Unknown",
                    "last_name": row[14] if row[14] else "",
                    "email": row[15] if row[15] else "N/A",
                    "phone": row[16] if row[16] else "N/A"
                }
            }
            bookings.append(booking)

        conn.close()

        print(f"[BOOKING] Found {len(bookings)} see later booking requests")
        if bookings:
            print(f"[BOOKING] Sample see later booking: {bookings[0]}")

        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching see later bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch see later bookings: {str(e)}")

@app.patch("/api/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: str,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Update booking status (pending, see_later, accepted, rejected)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Updating booking {booking_id} status to {status}")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Validate status
        valid_statuses = ['pending', 'see_later', 'accepted', 'rejected', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get current booking status
        cursor.execute("SELECT status FROM bookings WHERE id = ?", (booking_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="Booking not found")

        old_status = result[0]

        # Update booking status
        cursor.execute("""
            UPDATE bookings
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, booking_id))

        conn.commit()
        conn.close()

        print(f"[BOOKING] Updated booking {booking_id} from {old_status} to {status}")

        return {
            "success": True,
            "booking_id": booking_id,
            "old_status": old_status,
            "new_status": status,
            "updated_at": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error updating booking status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update booking status: {str(e)}")

@app.get("/api/bouncer/dashboard/metrics")
async def get_dashboard_metrics(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get comprehensive dashboard metrics for bouncer including active bookings, monthly stats, and ratings"""
    try:
        # Get and validate token
        token = authorization
        print(f"[DASHBOARD] Getting dashboard metrics")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            user_email = payload.get("email")

            if not user_email or not user_email.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user email")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get bouncer's user ID from email
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_email,))
        user_result = cursor.fetchone()

        if not user_result:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")

        bouncer_user_id = user_result[0]

        # 1. Get Active Bookings count (accepted or in_progress status)
        cursor.execute("""
            SELECT COUNT(*)
            FROM bookings
            WHERE bouncer_id IN (
                SELECT id FROM service_profiles WHERE user_id = ?
            )
            AND status IN ('accepted', 'in_progress')
        """, (bouncer_user_id,))

        active_bookings_count = cursor.fetchone()[0] or 0

        # 2. Get This Month Statistics
        from datetime import datetime
        current_month = datetime.now().strftime('%Y-%m')

        cursor.execute("""
            SELECT
                COUNT(*) as bookings_count,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(
                    (julianday(end_datetime) - julianday(start_datetime)) * 24
                ), 0) as total_hours
            FROM bookings
            WHERE bouncer_id IN (
                SELECT id FROM service_profiles WHERE user_id = ?
            )
            AND status IN ('completed', 'accepted', 'in_progress')
            AND strftime('%Y-%m', start_datetime) = ?
        """, (bouncer_user_id, current_month))

        month_stats = cursor.fetchone()
        monthly_bookings = month_stats[0] or 0
        monthly_revenue = float(month_stats[1]) if month_stats[1] else 0.0
        monthly_hours = round(float(month_stats[2])) if month_stats[2] else 0

        # 3. Get Rating Information
        # For now, we'll calculate from completed bookings
        # In future, this should come from a reviews/ratings table
        cursor.execute("""
            SELECT COUNT(*) as total_bookings
            FROM bookings
            WHERE bouncer_id IN (
                SELECT id FROM service_profiles WHERE user_id = ?
            )
            AND status = 'completed'
        """, (bouncer_user_id,))

        completed_bookings = cursor.fetchone()[0] or 0

        # Default rating calculation (placeholder until reviews system is implemented)
        # Using a simple metric: completion rate contributes to rating
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM bookings
            WHERE bouncer_id IN (
                SELECT id FROM service_profiles WHERE user_id = ?
            )
            AND status IN ('completed', 'cancelled', 'rejected')
        """, (bouncer_user_id,))

        rating_data = cursor.fetchone()
        total_jobs = rating_data[0] or 0
        completed_jobs = rating_data[1] or 0

        # Calculate rating based on completion rate (placeholder)
        if total_jobs > 0:
            completion_rate = completed_jobs / total_jobs
            average_rating = 3.0 + (completion_rate * 2.0)  # Scale from 3.0 to 5.0
            average_rating = round(average_rating, 1)
        else:
            average_rating = 0.0

        # 4. Get recent activity summary
        cursor.execute("""
            SELECT
                status,
                COUNT(*) as count
            FROM bookings
            WHERE bouncer_id IN (
                SELECT id FROM service_profiles WHERE user_id = ?
            )
            GROUP BY status
        """, (bouncer_user_id,))

        status_breakdown = {}
        for row in cursor.fetchall():
            status_breakdown[row[0]] = row[1]

        conn.close()

        metrics = {
            "success": True,
            "active_bookings": {
                "count": active_bookings_count,
                "label": "Active Bookings"
            },
            "monthly_stats": {
                "revenue": monthly_revenue,
                "bookings_count": monthly_bookings,
                "hours_worked": monthly_hours,
                "month": datetime.now().strftime('%B %Y')
            },
            "rating": {
                "average": average_rating,
                "total_reviews": completed_bookings,
                "total_jobs": total_jobs
            },
            "status_breakdown": status_breakdown,
            "last_updated": datetime.now().isoformat()
        }

        print(f"[DASHBOARD] Metrics for user {user_email}: {metrics}")

        return metrics

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching dashboard metrics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard metrics: {str(e)}")

@app.get("/api/bookings/individual")
async def get_individual_booking_requests(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get all pending individual booking requests (for bouncers to view)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Getting individual booking requests")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get pending bookings where special_requirements contains "Book Type: individual"
        cursor.execute("""
            SELECT
                b.id, b.user_id, b.event_name, b.event_description,
                b.event_location_address, b.start_datetime, b.end_datetime,
                b.hourly_rate, b.total_amount, b.special_requirements,
                b.status, b.created_at,
                u.first_name, u.last_name, u.email, u.phone
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = 'pending'
            AND b.special_requirements LIKE '%Book Type: individual%'
            ORDER BY b.created_at DESC
        """)

        bookings = []
        for row in cursor.fetchall():
            booking = {
                "id": row[0],
                "user_id": row[1],
                "event_name": row[2],
                "event_description": row[3],
                "event_location": row[4],
                "start_datetime": row[5],
                "end_datetime": row[6],
                "hourly_rate": row[7],
                "total_amount": row[8],
                "special_requirements": row[9],
                "status": row[10],
                "created_at": row[11],
                "user_info": {
                    "first_name": row[12] if row[12] else "Unknown",
                    "last_name": row[13] if row[13] else "",
                    "email": row[14] if row[14] else "N/A",
                    "phone": row[15] if row[15] else "N/A"
                }
            }
            bookings.append(booking)

        conn.close()

        print(f"[BOOKING] Found {len(bookings)} individual booking requests")

        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings),
            "type": "individual"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching individual bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch individual bookings: {str(e)}")

@app.get("/api/bookings/group")
async def get_group_booking_requests(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Get all pending group booking requests (for bouncers to view)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Getting group booking requests")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get pending bookings where special_requirements contains "Book Type: group"
        cursor.execute("""
            SELECT
                b.id, b.user_id, b.event_name, b.event_description,
                b.event_location_address, b.start_datetime, b.end_datetime,
                b.hourly_rate, b.total_amount, b.special_requirements,
                b.status, b.created_at,
                u.first_name, u.last_name, u.email, u.phone
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = 'pending'
            AND b.special_requirements LIKE '%Book Type: group%'
            ORDER BY b.created_at DESC
        """)

        bookings = []
        for row in cursor.fetchall():
            booking = {
                "id": row[0],
                "user_id": row[1],
                "event_name": row[2],
                "event_description": row[3],
                "event_location": row[4],
                "start_datetime": row[5],
                "end_datetime": row[6],
                "hourly_rate": row[7],
                "total_amount": row[8],
                "special_requirements": row[9],
                "status": row[10],
                "created_at": row[11],
                "user_info": {
                    "first_name": row[12] if row[12] else "Unknown",
                    "last_name": row[13] if row[13] else "",
                    "email": row[14] if row[14] else "N/A",
                    "phone": row[15] if row[15] else "N/A"
                }
            }
            bookings.append(booking)

        conn.close()

        print(f"[BOOKING] Found {len(bookings)} group booking requests")

        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings),
            "type": "group"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching group bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch group bookings: {str(e)}")

@app.patch("/api/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: str,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Update booking status (for bouncers to accept/reject)"""
    try:
        # Get and validate token
        token = authorization
        print(f"[BOOKING] Updating booking {booking_id} status to {status}")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Validate status
        valid_statuses = ['pending', 'accepted', 'rejected', 'confirmed', 'completed', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Check if booking exists
        cursor.execute("SELECT id, user_id, status FROM bookings WHERE id = ?", (booking_id,))
        booking = cursor.fetchone()

        if not booking:
            conn.close()
            raise HTTPException(status_code=404, detail="Booking not found")

        # Update booking status and assign bouncer if accepting
        if status == 'accepted':
            cursor.execute("""
                UPDATE bookings
                SET status = ?, bouncer_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, user_id, booking_id))
        else:
            cursor.execute("""
                UPDATE bookings
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, booking_id))

        conn.commit()
        conn.close()

        print(f"[BOOKING] Updated booking {booking_id} to status {status}")

        return {
            "success": True,
            "message": f"Booking status updated to {status}",
            "booking_id": booking_id,
            "status": status
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error updating booking status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update booking status: {str(e)}")

@app.post("/api/service-profiles")
async def create_service_profile(profile: ServiceProfileCreate, authorization: Optional[str] = Header(None, alias="Authorization")):
    """Create a new service profile for bouncer"""
    try:
        # Get token from Authorization header
        token = authorization

        print(f"[AUTH] Received authorization header: {authorization[:50] if authorization else 'None'}...")

        # Verify JWT token
        if not token:
            print("[AUTH] No token provided in request")
            raise HTTPException(status_code=401, detail="No authentication token provided")

        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
            print(f"[AUTH] Token after removing Bearer prefix: {token[:50]}...")

        try:
            # Decode and validate token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            user_email = payload.get("email")
            user_role = payload.get("role")

            print(f"[AUTH] Token decoded successfully. User ID: {user_id}, Email: {user_email}, Role: {user_role}")

            if not user_id:
                print("[AUTH] Token payload missing 'sub' field")
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

            # Additional validation: Ensure user_id is not just whitespace
            if not user_id.strip():
                print("[AUTH] Token has empty user ID")
                raise HTTPException(status_code=401, detail="Invalid token: empty user ID")

            print(f"[AUTH] User ID validated: {user_id}")

        except jwt.ExpiredSignatureError:
            print("[AUTH] Token has expired")
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            print(f"[AUTH] Invalid token error: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            print(f"[AUTH] Unexpected token validation error: {str(e)}")
            raise HTTPException(status_code=401, detail="Token validation failed")

        # Validate profile type
        if profile.profile_type not in ['individual', 'group']:
            raise HTTPException(status_code=400, detail="Invalid profile type")

        # Validate required data before database insertion
        if not user_id or not user_id.strip():
            print(f"[ERROR] Cannot create profile: invalid user_id: {user_id}")
            raise HTTPException(status_code=400, detail="Cannot create profile: invalid user identification")

        # Generate profile ID
        profile_id = str(uuid.uuid4())

        print(f"[PROFILE] Creating profile for user_id: {user_id}, type: {profile.profile_type}, name: {profile.name}")

        # Convert members list to JSON string if exists
        members_json = None
        if profile.members:
            import json
            members_json = json.dumps(profile.members)

        # Insert profile into database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO service_profiles
            (id, user_id, profile_type, name, location, phone_number, amount_per_hour,
             group_name, member_count, members, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            profile_id,
            user_id,
            profile.profile_type,
            profile.name,
            profile.location,
            profile.phone_number,
            profile.amount_per_hour,
            profile.group_name,
            profile.member_count,
            members_json
        ))

        print(f"[PROFILE] Successfully inserted profile {profile_id} for user {user_id}")

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Profile saved successfully!",
            "profile_id": profile_id,
            "profile_type": profile.profile_type
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating service profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@app.get("/api/service-profiles")
async def get_all_service_profiles():
    """Get all active service profiles for users to browse"""
    try:
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get all active profiles with user information
        # Using LEFT JOIN to include profiles even if user_id is NULL or user doesn't exist
        cursor.execute("""
            SELECT
                sp.id, sp.user_id, sp.profile_type, sp.name, sp.location,
                sp.phone_number, sp.amount_per_hour, sp.group_name,
                sp.member_count, sp.members, sp.created_at,
                u.first_name, u.last_name, u.email
            FROM service_profiles sp
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sp.is_active = 1
            ORDER BY sp.created_at DESC
        """)

        profiles = []
        for row in cursor.fetchall():
            import json
            members = None
            if row[9]:
                try:
                    members = json.loads(row[9])
                except:
                    members = None

            profile = {
                "id": row[0],
                "user_id": row[1],
                "profile_type": row[2],
                "name": row[3],
                "location": row[4],
                "phone_number": row[5],
                "amount_per_hour": row[6],
                "group_name": row[7],
                "member_count": row[8],
                "members": members,
                "created_at": row[10],
                "bouncer_first_name": row[11] if row[11] else "Unknown",
                "bouncer_last_name": row[12] if row[12] else "",
                "bouncer_email": row[13] if row[13] else "N/A"
            }
            profiles.append(profile)

        conn.close()

        # Separate profiles by type
        individual_profiles = [p for p in profiles if p["profile_type"] == "individual"]
        group_profiles = [p for p in profiles if p["profile_type"] == "group"]

        return {
            "success": True,
            "individual_profiles": individual_profiles,
            "group_profiles": group_profiles,
            "total_count": len(profiles)
        }

    except Exception as e:
        print(f"Error fetching service profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profiles: {str(e)}")

@app.get("/api/service-profiles/my-profiles")
async def get_my_profiles(token: str = Header(None, alias="Authorization")):
    """Get service profiles for the authenticated bouncer"""
    try:
        print(f"[AUTH] Getting my profiles. Token received: {token[:50] if token else 'None'}...")

        # Verify JWT token
        if not token:
            print("[AUTH] No token provided for my-profiles request")
            raise HTTPException(status_code=401, detail="No authentication token provided")

        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
            print(f"[AUTH] Token after removing Bearer: {token[:50]}...")

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            user_email = payload.get("email")

            print(f"[AUTH] My-profiles token decoded. User ID: {user_id}, Email: {user_email}")

            if not user_id:
                print("[AUTH] Token missing user ID")
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            print("[AUTH] Token expired for my-profiles")
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            print(f"[AUTH] Invalid token for my-profiles: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            print(f"[AUTH] Token validation error for my-profiles: {str(e)}")
            raise HTTPException(status_code=401, detail="Token validation failed")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id, profile_type, name, location, phone_number, amount_per_hour,
                group_name, member_count, members, is_active, created_at
            FROM service_profiles
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))

        profiles = []
        for row in cursor.fetchall():
            import json
            members = None
            if row[8]:
                try:
                    members = json.loads(row[8])
                except:
                    members = None

            profile = {
                "id": row[0],
                "profile_type": row[1],
                "name": row[2],
                "location": row[3],
                "phone_number": row[4],
                "amount_per_hour": row[5],
                "group_name": row[6],
                "member_count": row[7],
                "members": members,
                "is_active": bool(row[9]),
                "created_at": row[10]
            }
            profiles.append(profile)

        conn.close()

        return {
            "success": True,
            "profiles": profiles
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching my profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profiles: {str(e)}")

@app.put("/api/service-profiles/{profile_id}")
async def update_service_profile(
    profile_id: str,
    profile: ServiceProfileUpdate,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Update an existing service profile"""
    try:
        # Get and validate token
        token = authorization
        print(f"[UPDATE] Updating profile {profile_id}")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Connect to database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Verify profile belongs to user
        cursor.execute("""
            SELECT user_id, profile_type, name
            FROM service_profiles
            WHERE id = ?
        """, (profile_id,))

        existing_profile = cursor.fetchone()

        if not existing_profile:
            conn.close()
            raise HTTPException(status_code=404, detail="Profile not found")

        if existing_profile[0] != user_id:
            conn.close()
            raise HTTPException(status_code=403, detail="Not authorized to update this profile")

        print(f"[UPDATE] Existing profile: type={existing_profile[1]}, name={existing_profile[2]}")

        # Build UPDATE query dynamically based on provided fields
        update_fields = []
        update_values = []

        if profile.profile_type is not None:
            update_fields.append("profile_type = ?")
            update_values.append(profile.profile_type)
            print(f"[UPDATE] Changing profile_type to: {profile.profile_type}")

        if profile.name is not None:
            update_fields.append("name = ?")
            update_values.append(profile.name)

        if profile.location is not None:
            update_fields.append("location = ?")
            update_values.append(profile.location)

        if profile.phone_number is not None:
            update_fields.append("phone_number = ?")
            update_values.append(profile.phone_number)

        if profile.amount_per_hour is not None:
            update_fields.append("amount_per_hour = ?")
            update_values.append(profile.amount_per_hour)

        if profile.group_name is not None:
            update_fields.append("group_name = ?")
            update_values.append(profile.group_name)

        if profile.member_count is not None:
            update_fields.append("member_count = ?")
            update_values.append(profile.member_count)

        if profile.members is not None:
            import json
            update_fields.append("members = ?")
            update_values.append(json.dumps(profile.members))

        if profile.is_active is not None:
            update_fields.append("is_active = ?")
            update_values.append(1 if profile.is_active else 0)

        # Always update the updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")

        if not update_fields:
            conn.close()
            return {"success": True, "message": "No fields to update"}

        # Execute update
        update_query = f"""
            UPDATE service_profiles
            SET {', '.join(update_fields)}
            WHERE id = ? AND user_id = ?
        """
        update_values.extend([profile_id, user_id])

        cursor.execute(update_query, tuple(update_values))
        conn.commit()

        rows_affected = cursor.rowcount
        print(f"[UPDATE] Updated {rows_affected} row(s)")

        conn.close()

        return {
            "success": True,
            "message": "Profile updated successfully!",
            "profile_id": profile_id,
            "rows_updated": rows_affected
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@app.delete("/api/service-profiles/{profile_id}")
async def delete_service_profile(
    profile_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Delete (deactivate) a service profile"""
    try:
        # Get and validate token
        token = authorization
        print(f"[DELETE] Deleting profile {profile_id}")

        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")

        if token.startswith("Bearer "):
            token = token[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # Soft delete - just set is_active to 0
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE service_profiles
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        """, (profile_id, user_id))

        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()

        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Profile not found or not authorized")

        print(f"[DELETE] Deactivated profile {profile_id}")

        return {
            "success": True,
            "message": "Profile deleted successfully!",
            "profile_id": profile_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error deleting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete profile: {str(e)}")

# ==================== USER PROFILE ENDPOINTS ====================

@app.get("/api/user/profile")
async def get_user_profile(authorization: Optional[str] = Header(None)):
    """Get complete user profile including personal info, stats, and bookings"""
    try:
        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get user basic info
        cursor.execute("""
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
                   u.is_active, u.is_verified, u.created_at, u.last_login, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        """, (user_id,))

        user_row = cursor.fetchone()

        if not user_row:
            conn.close()
            print(f"[ERROR] User not found in database for user_id: {user_id}")
            raise HTTPException(status_code=404, detail=f"User not found. Please ensure you're logged in with a valid account.")

        # Get user profile additional info (create if doesn't exist)
        cursor.execute("""
            SELECT bio, location_address, location_lat, location_lng,
                   emergency_contact_name, emergency_contact_phone
            FROM user_profiles
            WHERE user_id = ?
        """, (user_id,))

        profile_row = cursor.fetchone()

        # If profile doesn't exist, create an empty one
        if not profile_row:
            try:
                cursor.execute("""
                    INSERT INTO user_profiles (id, user_id, bio, location_address, emergency_contact_name, emergency_contact_phone)
                    VALUES (?, ?, '', '', '', '')
                """, (str(uuid.uuid4()), user_id))
                conn.commit()
                print(f"[INFO] Created new profile for user: {user_id}")
                profile_row = ('', '', None, None, '', '')
            except Exception as profile_error:
                print(f"[WARNING] Could not create profile: {str(profile_error)}")
                profile_row = ('', '', None, None, '', '')

        # Get booking stats
        cursor.execute("""
            SELECT
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_bookings,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_bookings
            FROM bookings
            WHERE user_id = ?
        """, (user_id,))

        stats_row = cursor.fetchone()

        conn.close()

        return {
            "success": True,
            "user": {
                "id": user_row[0],
                "email": user_row[1],
                "firstName": user_row[2],
                "lastName": user_row[3],
                "phone": user_row[4] or "",
                "avatarUrl": user_row[5] or "",
                "isActive": bool(user_row[6]),
                "isVerified": bool(user_row[7]),
                "createdAt": user_row[8],
                "lastLogin": user_row[9],
                "role": user_row[10],
            },
            "profile": {
                "bio": profile_row[0] if profile_row else "",
                "locationAddress": profile_row[1] if profile_row else "",
                "locationLat": float(profile_row[2]) if profile_row and profile_row[2] else None,
                "locationLng": float(profile_row[3]) if profile_row and profile_row[3] else None,
                "emergencyContactName": profile_row[4] if profile_row else "",
                "emergencyContactPhone": profile_row[5] if profile_row else "",
            },
            "stats": {
                "totalBookings": stats_row[0] or 0,
                "acceptedBookings": stats_row[1] or 0,
                "pendingBookings": stats_row[2] or 0,
                "rejectedBookings": stats_row[3] or 0,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@app.put("/api/user/profile")
async def update_user_profile(
    authorization: Optional[str] = Header(None),
    first_name: str = Form(None),
    last_name: str = Form(None),
    phone: str = Form(None),
    bio: str = Form(None),
    location_address: str = Form(None),
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None),
    emergency_contact_name: str = Form(None),
    emergency_contact_phone: str = Form(None),
):
    """Update user profile information"""
    try:
        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Update user basic info
        update_fields = []
        update_values = []

        if first_name is not None:
            update_fields.append("first_name = ?")
            update_values.append(first_name)

        if last_name is not None:
            update_fields.append("last_name = ?")
            update_values.append(last_name)

        if phone is not None:
            update_fields.append("phone = ?")
            update_values.append(phone)

        if update_fields:
            update_values.append(user_id)
            cursor.execute(f"""
                UPDATE users
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, update_values)

        # Check if user profile exists
        cursor.execute("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,))
        profile_exists = cursor.fetchone()

        # Update or create user profile
        if profile_exists:
            profile_update_fields = []
            profile_update_values = []

            if bio is not None:
                profile_update_fields.append("bio = ?")
                profile_update_values.append(bio)

            if location_address is not None:
                profile_update_fields.append("location_address = ?")
                profile_update_values.append(location_address)

            if location_lat is not None:
                profile_update_fields.append("location_lat = ?")
                profile_update_values.append(location_lat)

            if location_lng is not None:
                profile_update_fields.append("location_lng = ?")
                profile_update_values.append(location_lng)

            if emergency_contact_name is not None:
                profile_update_fields.append("emergency_contact_name = ?")
                profile_update_values.append(emergency_contact_name)

            if emergency_contact_phone is not None:
                profile_update_fields.append("emergency_contact_phone = ?")
                profile_update_values.append(emergency_contact_phone)

            if profile_update_fields:
                profile_update_values.append(user_id)
                cursor.execute(f"""
                    UPDATE user_profiles
                    SET {', '.join(profile_update_fields)}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                """, profile_update_values)
        else:
            # Create new profile
            profile_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO user_profiles
                (id, user_id, bio, location_address, location_lat, location_lng,
                 emergency_contact_name, emergency_contact_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (profile_id, user_id, bio or "", location_address or "",
                  location_lat, location_lng, emergency_contact_name or "",
                  emergency_contact_phone or ""))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Profile updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Update profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@app.get("/api/user/bookings")
async def get_user_bookings(
    authorization: Optional[str] = Header(None),
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get user's booking history with optional filters"""
    try:
        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Build query with optional status filter
        # Note: Database schema uses start_datetime, end_datetime, total_amount (not event_date, event_time, budget)
        query = """
            SELECT b.id, b.event_name, b.event_location_address,
                   DATE(b.start_datetime) as event_date,
                   TIME(b.start_datetime) as event_time,
                   b.total_amount, b.status, b.created_at,
                   CASE
                       WHEN b.bouncer_id IS NOT NULL THEN 'individual'
                       ELSE 'general'
                   END as booking_type
            FROM bookings b
            WHERE b.user_id = ?
        """
        params = [user_id]

        if status:
            query += " AND b.status = ?"
            params.append(status)

        query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        bookings = cursor.fetchall()

        conn.close()

        return {
            "success": True,
            "bookings": [
                {
                    "id": booking[0],
                    "eventName": booking[1],
                    "eventLocation": booking[2],
                    "eventDate": booking[3],
                    "eventTime": booking[4],
                    "budget": str(booking[5]) if booking[5] else "0",
                    "status": booking[6],
                    "createdAt": booking[7],
                    "bookingType": booking[8],
                }
                for booking in bookings
            ],
            "total": len(bookings)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Get bookings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookings: {str(e)}")


@app.post("/api/user/change-password")
async def change_password(
    authorization: Optional[str] = Header(None),
    current_password: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...)
):
    """Change user password"""
    try:
        # Validate passwords match
        if new_password != confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")

        # Validate password complexity
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

        if not any(c.islower() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in new_password):
            raise HTTPException(status_code=400, detail="Password must contain at least one number")

        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get current password hash
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")

        # Verify current password
        if not pwd_context.verify(current_password, result[0]):
            conn.close()
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Update to new password
        new_password_hash = pwd_context.hash(new_password)
        cursor.execute("""
            UPDATE users
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (new_password_hash, user_id))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Password changed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Change password error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")


@app.post("/api/user/upload-avatar")
async def upload_avatar(
    authorization: Optional[str] = Header(None),
    avatar_data: str = Form(...)
):
    """Upload user avatar (base64 encoded image)"""
    try:
        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        # For now, we'll just store the base64 data URL
        # In production, you'd want to upload to cloud storage (S3, Cloudinary, etc.)
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users
            SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (avatar_data, user_id))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Avatar uploaded successfully",
            "avatarUrl": avatar_data
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Upload avatar error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("Starting simple login server...")
    print("Available at: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)