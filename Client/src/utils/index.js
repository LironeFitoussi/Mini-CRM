// src/utils/index.js

// Capitalize the first letter of a string
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Map MUI color to actual color codes if needed
export const getStatusColor = (muiColor) => {
  switch (muiColor) {
    case "success":
      return "green";
    case "warning":
      return "goldenrod";
    case "error":
      return "red";
    default:
      return "grey";
  }
};

export const emailFooter = `
<!-- Email Footer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
  <tr>
    <td align="center">
      <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/logo%20table%20mail.jpeg"
           alt="Email Footer"
           style="max-width: 100%; height: auto;" />
    </td>
  </tr>
</table>
`;
