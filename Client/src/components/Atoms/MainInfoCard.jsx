import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";

const MainInfoCard = ({ title, type, content }) => {
  // console.log(content);

  const { t } = useTranslation();

  const colors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  const displayContent = () => {
    if (content.length === 0) {
      return (
        <div className="flex justify-center mt-4">
          <CircularProgress color="white" />
        </div>
      );
    }
    return <p className="text-3xl font-bold mt-2">{content}</p>;
  };

  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${colors[type]}`}>
      <h2 className="text-xl font-semibold">{t(title)}</h2>
      {displayContent()}
    </div>
  );
};

export default MainInfoCard;
