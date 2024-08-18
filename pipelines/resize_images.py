import os
from PIL import Image


def resize_and_convert_images(input_dir, output_dir, size=(250, 250)):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(("jpg", "jpeg", "png", "svg")):
            img_path = os.path.join(input_dir, filename)
            try:
                with Image.open(img_path) as img:
                    img = img.convert("RGBA")  # Ensure image has alpha channel

                    # Preserve aspect ratio while resizing
                    img.thumbnail(size, Image.LANCZOS)

                    base_filename = os.path.splitext(filename)[0]
                    output_path = os.path.join(output_dir, f"{base_filename}.png")
                    img.save(output_path, "PNG", quality=95)
                    print(f"Processed {filename} -> {output_path}")
            except Exception as e:
                print(f"Failed to process {filename}: {e}")


if __name__ == "__main__":
    input_directory = "public/images/uni_images/uni_logos"
    output_directory = "public/images/uni_images/uni_logos"
    resize_and_convert_images(input_directory, output_directory)
