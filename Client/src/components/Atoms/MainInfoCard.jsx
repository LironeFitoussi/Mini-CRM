import { useTranslation } from "react-i18next";

const MainInfoCard = ({ title, type, content }) => {
  const { t } = useTranslation();

  const colors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  // console.log(title);
  
  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${colors[type]}`}>
      <h2 className="text-xl font-semibold">{t(title)}</h2>
      <p className="text-3xl font-bold mt-2">{content}</p>
    </div>
  );
};

export default MainInfoCard;
