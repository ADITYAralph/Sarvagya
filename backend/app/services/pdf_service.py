import io
import re
import logging
from typing import Dict, Any
from pypdf import PdfReader

logger = logging.getLogger("sarvagya.pdf_service")

# Standard section headers expected in a genuine resume document
STANDARD_RESUME_HEADERS = [
    "experience", "work", "projects", "education", "skills", 
    "summary", "employment", "qualifications", "certifications"
]

def validate_and_extract_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text section-by-section preserving line breaks and structural headers.
    Performs word count validation (< 50 words) and standard heading verification.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        pages_text = []
        
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                # Clean multiple trailing spaces while preserving explicit line breaks
                clean_page = "\n".join(line.rstrip() for line in page_text.splitlines() if line.strip())
                pages_text.append(f"--- PAGE {idx + 1} ---\n" + clean_page)
        
        extracted_text = "\n\n".join(pages_text).strip()
        lines = extracted_text.splitlines()
        words = re.findall(r'\b[A-Za-z0-9+#.-]+\b', extracted_text)
        
        char_count = len(extracted_text)
        word_count = len(words)
        line_count = len(lines)

        # Print / log exact backend debug info
        debug_msg = f"[PDF DEBUG] Character Count: {char_count}, Word Count: {word_count}, Lines: {line_count}"
        print(debug_msg)
        logger.info(debug_msg)
        print(f"[PDF DEBUG] Extracted Text Preview:\n{extracted_text[:350]}\n...")

        # Non-resume / Low Quality Detection Threshold (< 50 words)
        if word_count < 50:
            return {
                "is_valid": False,
                "text": extracted_text,
                "word_count": word_count,
                "char_count": char_count,
                "line_count": line_count,
                "error_reason": "Document invalid or lacks recognizable resume sections/text (word count < 50)."
            }

        # Heading detection check
        text_lower = extracted_text.lower()
        matched_headers = [h for h in STANDARD_RESUME_HEADERS if h in text_lower]
        
        if len(matched_headers) < 2:
            return {
                "is_valid": False,
                "text": extracted_text,
                "word_count": word_count,
                "char_count": char_count,
                "line_count": line_count,
                "error_reason": "Document invalid or lacks recognizable resume sections/text (missing standard Experience, Education, Skills, or Projects headers)."
            }

        return {
            "is_valid": True,
            "text": extracted_text,
            "word_count": word_count,
            "char_count": char_count,
            "line_count": line_count,
            "error_reason": ""
        }

    except Exception as e:
        logger.error(f"Error parsing PDF document structure: {e}")
        return {
            "is_valid": False,
            "text": "",
            "word_count": 0,
            "char_count": 0,
            "line_count": 0,
            "error_reason": f"Document invalid or unreadable PDF: {str(e)}"
        }

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Backward compatibility wrapper returning raw extracted text.
    """
    res = validate_and_extract_pdf(pdf_bytes)
    return res["text"] if res["text"] else res["error_reason"]
