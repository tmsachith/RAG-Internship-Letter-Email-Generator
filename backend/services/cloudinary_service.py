import cloudinary
import cloudinary.uploader
from config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_pdf_to_cloudinary(file_content, filename: str):
    """Upload PDF to Cloudinary and return URL and public_id"""
    try:
        result = cloudinary.uploader.upload(
            file_content,
            resource_type="raw",
            folder="cv_uploads",
            public_id=filename
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise Exception(f"Failed to upload to Cloudinary: {str(e)}")

def delete_pdf_from_cloudinary(public_id: str):
    """Delete PDF from Cloudinary"""
    try:
        cloudinary.uploader.destroy(public_id, resource_type="raw")
    except Exception as e:
        raise Exception(f"Failed to delete from Cloudinary: {str(e)}")
