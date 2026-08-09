import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text content from PDF file bytes using PyPDF.
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_content = []
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        
        extracted_text = "\n".join(text_content).strip()
        if not extracted_text:
            return "Resume content extracted is empty or unreadable text."
        return extracted_text
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return "Failed to parse PDF document properly."
