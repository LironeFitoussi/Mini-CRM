import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import LanguageSwitcher from "./LanguageSwitcher";
import GlobatSearch from "../Atoms/GlobalSearch";
import NotificationsButton from "../Buttons/NotificationsButton";

const HorizontalNavbar = () => {
  const { t } = useTranslation();
  const { logout } = useAuth0();
  const user = useSelector((state) => state.user.user);
  
  return (
    <header className="bg-white text-gray-800 flex justify-between items-center shadow-md p-4 w-full">
      <div className="flex items-center space-x-6">
        <nav className="flex space-x-4 align-center justify-center">
          <Link
            to="/dashboard"
            className="px-3 py-2 hover:bg-gray-100 rounded-md transition"
          >
            <img src="/logo.gif"
              className="h-10 w-10"
             alt="" />
          </Link>
          <Link
            to="donators"
            className="px-3 py-2 hover:bg-gray-100 rounded-md transition flex items-center"
          >
            {t("general.donors")}
          </Link>
          <Link
            to="leads"
            className="px-3 py-2 hover:bg-gray-100 rounded-md transition flex items-center"
          >
            {t("leads")}
          </Link>
          {user?.role === "admin" || user?.role === "developer" ? (
            <Link
              to="users"
              className="px-3 py-2 hover:bg-gray-100 rounded-md transition flex items-center"
            >
              {t("userManagement.users")}
            </Link>
          ) : null}


        </nav>
      </div>
      <GlobatSearch />
      <div className="flex items-center space-x-4">
        <NotificationsButton />
        <LanguageSwitcher />
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          {t("general.logout")}
        </button>
      </div>
    </header>
  );
};

export default HorizontalNavbar;
