import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const fetchDashboardData = async () => {
  const { data } = await axios.get(
    import.meta.env.VITE_API_URL + "/api/v1/donators/total"
  );
  return data;
};

const MainInfoCard = ({ title, type }) => {
  const { t } = useTranslation();

  const colors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const contet = isLoading ? "Loading..." : data;

  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${colors[type]}`}>
      <h2 className="text-xl font-semibold">{t(title)}</h2>
      <p className="text-3xl font-bold mt-2">{contet}</p>
    </div>
  );
};

export default MainInfoCard;
