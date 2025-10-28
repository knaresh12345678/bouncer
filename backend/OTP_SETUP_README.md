# OTP Phone Verification Setup Guide

This guide explains how to configure the OTP (One-Time Password) phone verification system for the Bouncer app registration.

## Overview

The registration system now includes:
- **Phone number verification** via SMS OTP
- **6-digit OTP** sent to user's mobile
- **30-second cooldown** between OTP requests
- **3 attempt limit** for OTP verification
- **Secure API integration** with Twilio

## Configuration Options

### Option 1: Twilio SMS (Recommended for Production)

1. **Create a Twilio Account**
   - Sign up at [https://www.twilio.com](https://www.twilio.com)
   - Get your Account SID and Auth Token from the Console

2. **Get a Twilio Phone Number**
   - Purchase a phone number from Twilio Console
   - Make sure it supports SMS capabilities

3. **Configure Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit the .env file
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
   ```

4. **Install Required Dependencies**
   ```bash
   pip install twilio
   ```

5. **Set Production Mode**
   - In `simple_app.py`, change `TWILIO_CONFIG["development_mode"]` to `False`

### Option 2: Development Mode (Default)

For development and testing, the system runs in development mode:
- OTP is printed to the backend console
- No real SMS is sent
- Perfect for testing without SMS costs

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone_number": "1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "session_id": "uuid-string",
  "phone_number": "7890****"
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone_number": "1234567890",
  "otp": "123456",
  "session_id": "uuid-string"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "phone_number": "7890****",
  "verified": true
}
```

## Security Features

1. **Session-based OTP storage** with UUIDs
2. **10-minute OTP expiry**
3. **Maximum 3 verification attempts**
4. **Rate limiting** with 30-second cooldown
5. **Phone number masking** in responses
6. **Input validation** for phone numbers

## Frontend Integration

The React frontend automatically:
- Shows OTP field only after sending OTP
- Validates phone numbers (10 digits)
- Implements 30-second countdown timer
- Shows visual feedback for verification status
- Disables registration until OTP is verified

## Testing

1. **Development Testing:**
   - Keep `development_mode: True`
   - Enter a 10-digit phone number
   - Click "Send OTP"
   - Check backend console for OTP code
   - Enter OTP in verification field

2. **Production Testing:**
   - Configure Twilio credentials
   - Set `development_mode: False`
   - Test with real phone numbers

## Troubleshooting

### Common Issues

1. **"Failed to send OTP"**
   - Check Twilio credentials in .env file
   - Verify phone number format (10 digits)
   - Check Twilio account balance

2. **"Invalid OTP"**
   - Ensure OTP is 6 digits
   - Check if OTP expired (10 minutes)
   - Verify session ID is correct

3. **"Session expired"**
   - OTP expired after 10 minutes
   - Too many failed attempts (3 max)
   - Request new OTP

### Debug Mode

Enable console logging:
- Frontend: Check browser console for validation logs
- Backend: OTP is printed to console in development mode

## Cost Considerations

- **Twilio SMS**: ~$0.05 per SMS (varies by country)
- **Development**: Free (console output only)
- **Phone numbers**: ~$1/month per Twilio number

## Security Best Practices

1. Never commit `.env` file to version control
2. Use environment-specific configurations
3. Monitor OTP usage for abuse
4. Implement rate limiting in production
5. Use HTTPS in production

## Support

For issues:
1. Check backend console logs
2. Verify API endpoint responses
3. Test with development mode first
4. Check Twilio account status and credits