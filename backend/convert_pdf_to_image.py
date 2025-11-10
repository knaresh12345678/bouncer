import fitz  # PyMuPDF
from PIL import Image
import io
import sys

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Open the PDF
pdf_path = "../login and registeration background.pdf"
output_path = "../frontend/public/login-background.jpg"

# Open PDF
pdf_document = fitz.open(pdf_path)

# Get the first page
page = pdf_document[0]

# Set zoom factor for high quality (2.0 = 200% zoom = ~150 DPI)
zoom = 2.0
mat = fitz.Matrix(zoom, zoom)

# Render page to an image (pixmap)
pix = page.get_pixmap(matrix=mat)

# Convert to PIL Image
img_data = pix.tobytes("png")
img = Image.open(io.BytesIO(img_data))

# Save as JPEG with high quality
img.save(output_path, "JPEG", quality=95, optimize=True)

print(f"[OK] PDF converted successfully!")
print(f"   Output: {output_path}")
print(f"   Size: {img.width}x{img.height}px")

# Close the PDF
pdf_document.close()
