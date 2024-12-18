// src/components/CustomToolbar.jsx
import React from "react";
import { Box } from "@mui/material";

const CustomToolbar = () => (
  <Box id="toolbar" sx={{ border: "1px solid #ccc", borderRadius: "4px", mb: 1, padding: "5px" }}>
    {/* Standard Quill toolbar options */}
    <span className="ql-formats">
      <button className="ql-bold" title="Bold"></button>
      <button className="ql-italic" title="Italic"></button>
      <button className="ql-underline" title="Underline"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" title="Ordered List"></button>
      <button className="ql-list" value="bullet" title="Bullet List"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-clean" title="Remove Formatting"></button>
    </span>
    {/* Custom Add Link button */}
    <span className="ql-formats">
      <button className="ql-addLink" title="Add Link">
        {/* SVG icon for link */}
        <svg viewBox="0 0 18 18">
          <path
            className="ql-fill"
            d="M7.05 3.636l3.182 3.182-1.414 1.414L5.636 5.05a4 4 0 0 1 5.657-1.414zM10.364 14.95l-3.182-3.182 1.414-1.414 3.182 3.182a4 4 0 0 1-1.414 1.414z"
          ></path>
          <path
            className="ql-stroke"
            d="M7.05 3.636l3.182 3.182-1.414 1.414L5.636 5.05a4 4 0 0 1 5.657-1.414zM10.364 14.95l-3.182-3.182 1.414-1.414 3.182 3.182a4 4 0 0 1-1.414 1.414z"
          ></path>
        </svg>
      </button>
    </span>
  </Box>
);

export default CustomToolbar;
