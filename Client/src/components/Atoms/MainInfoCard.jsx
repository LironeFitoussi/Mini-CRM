import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from 'prop-types';

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
    if (!content) {
      return (
        <div className="flex justify-center mt-4">
          <CircularProgress color="white" />
        </div>
      );
    }

    // Handle object content (for currency amounts)
    if (typeof content === 'object' && content !== null) {
      return (
        <div className="mt-2">
          {Object.entries(content).map(([currency, amount]) => (
            <p key={currency} className="text-lg font-semibold">
              {currency}: {amount}
            </p>
          ))}
        </div>
      );
    }

    // Handle string/number content
    return <p className="text-3xl font-bold mt-2">{content}</p>;
  };

  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${colors[type]}`}>
      <h2 className="text-xl font-semibold">{t(title)}</h2>
      {displayContent()}
    </div>
  );
};

MainInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']).isRequired,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      '€': PropTypes.number,
      '₪': PropTypes.number
    })
  ]).isRequired
};

export default MainInfoCard;
