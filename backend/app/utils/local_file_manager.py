import base64
import hashlib
import io
import mimetypes
import os

from flask import current_app, url_for
from PIL import Image


def save_base64_to_file(
    base64_data, sub_folder="unattached", auto_file_extension=True, file_extension=".jpg", max_file_size=2 * 1024 * 1024
):
    """
    Save base64 encoded data to the static folder and return the file path.

    :param base64_data: base64 encoded data string
    :param auto_file_extension: Whether to automatically detect the file extension (default: True)
    :param file_extension: File extension (default: '.jpg')
    :return: Saved file path and URL
    """

    # Automatically detect file extension
    if auto_file_extension:
        if base64_data.startswith("data:"):
            mime_type = base64_data.split(";")[0].split(":")[1]
            file_extension = mimetypes.guess_extension(mime_type)
        else:
            raise ValueError("Base64 data does not contain a valid MIME type")

    # Remove the data:image/jpeg;base64, prefix
    if "," in base64_data:
        base64_data = base64_data.split(",")[1]

    # Decode base64 data
    try:
        file_data = base64.b64decode(base64_data)
    except base64.binascii.Error:
        raise ValueError("Invalid base64 data")

    # Generate a hash name for the file
    file_name_hash = hashlib.sha256(file_data).hexdigest()
    file_name = f"{file_name_hash}{file_extension}"

    # File save path
    static_folder = current_app.static_folder
    full_path = os.path.normpath(os.path.join(static_folder, f"{sub_folder}",file_name))
    if not full_path.startswith(static_folder):
        raise Exception("Invalid subfolder name")
    
    file_path = full_path

    # Ensure the static directory exists
    os.makedirs(static_folder, exist_ok=True)

    # Check file size, if larger than max_size, resize the image
    if len(file_data) > max_file_size and file_extension in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
        # Use Pillow to process the image
        image = Image.open(io.BytesIO(file_data))

        # Get the current dimensions of the image
        original_width, original_height = image.size

        # Resize the image to half its size
        new_width = original_width // 2
        new_height = original_height // 2
        resized_image = image.resize((new_width, new_height), Image.Resampling.BILINEAR)

        # Save the resized image to a byte stream
        output_stream = io.BytesIO()
        resized_image.save(output_stream, format=image.format)
        file_data = output_stream.getvalue()

    # Save the file
    with open(file_path, "wb") as file:
        file.write(file_data)

    # Return the file URL
    file_url = url_for("static", filename=file_name, _external=True)

    print(f"File saved to {file_path}, URL: {file_url}")
    return file_path, file_url
