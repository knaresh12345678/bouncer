"""
Currency Configuration for Indian Rupees (INR)
Centralized currency settings for the application
"""

# Currency Settings
CURRENCY_CODE = 'INR'
CURRENCY_SYMBOL = '₹'
CURRENCY_NAME = 'Indian Rupee'
CURRENCY_NAME_PLURAL = 'Indian Rupees'

# Number Formatting
DECIMAL_PLACES = 2
THOUSAND_SEPARATOR = ','
DECIMAL_SEPARATOR = '.'

# Indian Numbering System
USE_INDIAN_NUMBERING = True  # Use lakhs/crores system

# Payment Gateway Settings
PAYMENT_CURRENCY = 'INR'  # For Razorpay, PayU, etc.

# Validation
MIN_AMOUNT = 0.01
MAX_AMOUNT = 10000000.00  # 1 Crore

def format_indian_number(number):
    """
    Format number in Indian numbering system
    Example: 1000000 -> 10,00,000
    """
    if not isinstance(number, (int, float)):
        return str(number)

    # Convert to string and split into integer and decimal parts
    parts = f"{number:.2f}".split('.')
    integer_part = parts[0]
    decimal_part = parts[1] if len(parts) > 1 else '00'

    # Indian numbering: Last 3 digits, then groups of 2
    if len(integer_part) <= 3:
        formatted = integer_part
    else:
        last_three = integer_part[-3:]
        other_numbers = integer_part[:-3]

        # Add commas for groups of 2
        formatted_other = ''
        for i, digit in enumerate(reversed(other_numbers)):
            if i > 0 and i % 2 == 0:
                formatted_other = ',' + formatted_other
            formatted_other = digit + formatted_other

        formatted = formatted_other + ',' + last_three

    # Return with decimal if non-zero
    if float(decimal_part) > 0:
        return f"{formatted}.{decimal_part}"

    return formatted

def format_currency(amount):
    """
    Format amount with rupee symbol
    Example: 25000 -> ₹25,000
    """
    if not isinstance(amount, (int, float)):
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return f"{CURRENCY_SYMBOL}0"

    if USE_INDIAN_NUMBERING:
        return f"{CURRENCY_SYMBOL}{format_indian_number(amount)}"
    else:
        return f"{CURRENCY_SYMBOL}{amount:,.2f}"

def format_currency_compact(amount):
    """
    Format currency in compact form for displays
    Example: 1500000 -> ₹15L
    """
    if not isinstance(amount, (int, float)):
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return f"{CURRENCY_SYMBOL}0"

    if amount >= 10000000:  # Crores (10 million)
        return f"{CURRENCY_SYMBOL}{amount/10000000:.2f}Cr"
    elif amount >= 100000:  # Lakhs (100 thousand)
        return f"{CURRENCY_SYMBOL}{amount/100000:.2f}L"
    elif amount >= 1000:  # Thousands
        return f"{CURRENCY_SYMBOL}{amount/1000:.2f}K"
    else:
        return format_currency(amount)

def parse_currency(currency_string):
    """
    Parse formatted currency string to number
    Example: "₹1,00,000" -> 100000
    """
    if isinstance(currency_string, (int, float)):
        return float(currency_string)

    # Remove currency symbol and commas
    cleaned = str(currency_string).replace(CURRENCY_SYMBOL, '').replace(',', '').strip()

    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0

def validate_amount(amount):
    """
    Validate currency amount
    """
    try:
        amount_float = float(amount) if not isinstance(amount, float) else amount
        return MIN_AMOUNT <= amount_float <= MAX_AMOUNT
    except (ValueError, TypeError):
        return False

# Export all functions
__all__ = [
    'CURRENCY_CODE',
    'CURRENCY_SYMBOL',
    'CURRENCY_NAME',
    'CURRENCY_NAME_PLURAL',
    'PAYMENT_CURRENCY',
    'format_indian_number',
    'format_currency',
    'format_currency_compact',
    'parse_currency',
    'validate_amount',
]
