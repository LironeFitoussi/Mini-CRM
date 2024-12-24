import React, { useState } from "react";
import axios from "axios";

const ImageUploader = ({handleChange}) => {
  const [image, setImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (file) => {
    setImage(file);
    setUploadStatus("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus(`Upload successful! URL: ${response.data.url}`);
      handleChange("imageUrl", response.data.url);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
      setImage(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="w-full max-w-md p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {image ? (
          <p className="text-center text-gray-700">{image.name}</p>
        ) : (
          <p className="text-center text-gray-500">
            Drag and drop an image here, or click to select a file
          </p>
        )}
        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
      </div>

      {image && (
        <div className="mt-4 text-center">
          <p className="text-gray-600">File selected: {image.name}</p>
        </div>
      )}

      <button
        className={`mt-4 px-6 py-2 rounded-lg text-white ${
          isUploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={handleUpload}
        disabled={isUploading || !image}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>

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
