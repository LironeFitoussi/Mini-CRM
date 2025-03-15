import { useState, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
// import PropType
const ImageUploader = ({ handleChange }) => {
  // const Image
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadStatus(`Upload successful! URL: ${response.data.url}`);
      console.log("Image URL:", response.data.url);

      handleChange("imageUrl", response.data.url);
    } catch (error) {
      setUploadStatus(
        `Upload failed: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAreaClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="w-full max-w-md p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) {
            handleFileChange(file);
          }
        }}
        onClick={handleAreaClick}
      >
        {isUploading ? (
          <CircularProgress />
        ) : (
          <p className="text-center text-gray-500">
            {t("imageUploader.dragAndDrop") || "Drag and drop an image here, or click to select"}
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
          ref={inputRef}
        />
      </div>

      {uploadStatus && (
        <p
          className={`mt-4 ${
            uploadStatus.startsWith("Upload successful")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
