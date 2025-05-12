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
      <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/2025-05-12_07-48-36.jpeg"
           alt="Email Footer"
           style="max-width: 100%; height: auto;" />
    </td>
  </tr>
</table>
`;

export const getDonationTypes = (donations) => {
  return [
    {
      name: "Don spontané",
      value: donations.filter((d) => d.type === "Don spontané").length,
    },
    {
      name: "Aide au hayalim",
      value: donations.filter((d) => d.type === "Aide au hayalim").length,
    },
    {
      name: "Mikvé",
      value: donations.filter((d) => d.type === "Mikvé").length,
    },
    {
      name: "Aide aux Nécessiteux",
      value: donations.filter((d) => d.type === "Aide aux Nécessiteux").length,
    },
    {
      name: "Pessah",
      value: donations.filter((d) => d.type === "Pessah").length,
    },
    {
      name: "HANOUCA HAYALIM & YELADIM",
      value: donations.filter((d) => d.type === "HANOUCA HAYALIM & YELADIM")
        .length,
    },
    {
      name: "Pourim",
      value: donations.filter((d) => d.type === "Pourim").length,
    },
    {
      name: "kapparot",
      value: donations.filter((d) => d.type === "kapparot").length,
    },
    {
      name: "DBI",
      value: donations.filter((d) => d.type === "DBI").length,
    },
    {
      name: "merci",
      value: donations.filter((d) => d.type === "merci").length,
    },
    {
      name: "Ahdoute",
      value: donations.filter((d) => d.type === "Ahdoute").length,
    },
  ];
}