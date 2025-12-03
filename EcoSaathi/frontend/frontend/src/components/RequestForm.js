// src/components/RequestForm.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/RequestForm.css";
import PhotoPreviewModal from "./PhotoPreviewModal";
import AddressAutocomplete from "./AddressAutocomplete";

// --- Constants ---
const customPhotoLabels = [
  "Top Side (Required)",
  "Bottom Side",
  "Front Side",
  "Back Side",
  "Side Wall",
];

const API_BASE_URL = "http://localhost:8080";

// 💡 Component ab koi props nahi leta
export default function RequestForm() {
  // --- 1. HOOKS ---
  const navigate = useNavigate();

  // --- Get User Data and Initial Values ---
  const user = JSON.parse(localStorage.getItem("user"));
  const initialAddress = user?.pickupAddress || "";

  // --- 2. STATE ---
  // yeh hi tumhaare existing "Device Type" select se bound hai
  const [type, setType] = useState("Laptop"); // default pe device ka ek option

  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState(initialAddress);
  const [files, setFiles] = useState([null, null, null, null, null]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // 🆕 New fields (backend wale fields)
  const [brandModel, setBrandModel] = useState("");
  const [condition, setCondition] = useState("Working");
  const [quantity, setQuantity] = useState(1);
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  // --- 3. EARLY RETURN CHECK ---
  if (!user || !user.id) {
    return (
      <div className="request-form-card error-msg">
        ❌ Error: User data not found. Please log in again to submit a request.
      </div>
    );
  }

  const userId = user.id;

  // --- Handlers ---
  const handleAddressChange = (address) => {
    setPickupLocation(address);
    setMessage("");
  };

  const handleFileChange = (e, index) => {
    const selectedFile = e.target.files[0];
    const newFiles = [...files];
    newFiles[index] = selectedFile || null;
    setFiles(newFiles);
    setMessage("");
  };

  const handlePreview = (file) => {
    if (file) {
      setPreviewFile(URL.createObjectURL(file));
    }
  };

  const handleClosePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setPreviewFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const selectedFiles = files.filter((file) => file !== null);

    if (files[0] === null) {
      setMessage("❌ Top Side photo is required for submission.");
      setLoading(false);
      return;
    }

    if (!pickupLocation || pickupLocation.trim() === "") {
      setMessage("❌ Pickup location is required.");
      setLoading(false);
      return;
    }

    if (!description || description.trim() === "") {
      setMessage("❌ Item description is required.");
      setLoading(false);
      return;
    }

    if (!brandModel.trim()) {
      setMessage("❌ Brand & Model is required.");
      setLoading(false);
      return;
    }

    if (!quantity || quantity <= 0) {
      setMessage("❌ Please enter a valid quantity (minimum 1).");
      setLoading(false);
      return;
    }

    const formData = new FormData();

    // 🔹 Backend ke params ke hisaab se
    // type: server me abhi bhi use ho raha hai (history etc.)
    formData.append("type", type);

    // deviceType: naya field – filhaal same value bhej rahe hain
    formData.append("deviceType", type);

    formData.append("description", description);
    formData.append("pickupLocation", pickupLocation);

    formData.append("brandModel", brandModel);
    formData.append("condition", condition);
    formData.append("quantity", quantity);
    formData.append("additionalRemarks", additionalRemarks);

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/user/${userId}/request`,
        formData
      );
      setMessage("✅ Request submitted successfully! We will schedule it soon.");
      setDescription("");
      setBrandModel("");
      setCondition("Working");
      setQuantity(1);
      setAdditionalRemarks("");
      setFiles([null, null, null, null, null]);

      setTimeout(() => {
        navigate(`/profile/${userId}/history`);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit request. Check file size or server status.";
      setMessage(`❌ ${errorMessage}`);
      console.error("Request submission error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-form-card">
      {previewFile && (
        <PhotoPreviewModal imageUrl={previewFile} onClose={handleClosePreview} />
      )}

      <h3>New e-waste request</h3>
<form onSubmit={handleSubmit}>
  {/* ROW 1: DEVICE TYPE + BRAND & MODEL */}
  <div className="form-row">
    <div className="form-field">
      <label>Device Type:</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      >
        <option value="Laptop">Laptop</option>
        <option value="Mobile">Mobile</option>
        <option value="T.V.">T.V.</option>
        <option value="Printer">Printer</option>
        <option value="Motor">Motor</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div className="form-field">
      <label>Brand &amp; Model:</label>
      <input
        type="text"
        value={brandModel}
        onChange={(e) => setBrandModel(e.target.value)}
        placeholder="e.g., Dell Inspiron 5520, Samsung S21, LG 42-inch LED"
        required
      />
    </div>
  </div>

  {/* ROW 2: CONDITION + QUANTITY */}
  <div className="form-row">
    <div className="form-field">
      <label>Condition:</label>
      <select
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        required
      >
        <option value="Working">Working</option>
        <option value="Damaged">Damaged</option>
        <option value="Dead">Dead</option>
      </select>
    </div>

    <div className="form-field">
      <label>Quantity:</label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
        required
      />
    </div>
  </div>

  {/* ROW 3: DESCRIPTION + PICKUP ADDRESS */}
  <div className="form-row">
    <div className="form-field">
      <label>Description (Items, details, etc.):</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., 2 old monitors, 1 keyboard, accessories, cables, etc."
        required
      />
    </div>

    <div className="form-field">
      <label>Preferred Pickup Address:</label>
      <AddressAutocomplete
        initialValue={pickupLocation}
        onPlaceSelect={handleAddressChange}
        placeholder="Search for pickup address..."
      />
    </div>
  </div>

  {/* ADDITIONAL REMARKS (full width) */}
  <label>Additional Remarks (optional):</label>
  <textarea
    value={additionalRemarks}
    onChange={(e) => setAdditionalRemarks(e.target.value)}
    placeholder="Any extra info for pickup partner (landmark, floor, timing, etc.)"
  />

  {/* PHOTOS – same as before */}
  <div className="photo-upload-section">
    <label>Upload Photos (Max 5):</label>
    <p className="photo-hint">
      Photos help us understand the size and type of the items.
    </p>
    <div className="photo-inputs">
      {files.map((file, index) => (
        <div key={index} className="file-input-group">
          <label htmlFor={`file-${index + 1}`}>
            {customPhotoLabels[index]}
          </label>
          <input
            id={`file-${index + 1}`}
            type="file"
            accept="image/*"
            required={index === 0}
            onChange={(e) => handleFileChange(e, index)}
          />
          {file && (
            <div className="file-actions">
              <span className="file-name-display">{file.name}</span>
              <button
                type="button"
                className="preview-btn"
                onClick={() => handlePreview(file)}
              >
                Preview
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Submitting..." : "Submit Request"}
  </button>

  {message && (
    <p
      className={
        message.startsWith("✅") ? "success-message" : "error-message"
      }
    >
      {message}
    </p>
  )}
</form>

    </div>
  );
}
