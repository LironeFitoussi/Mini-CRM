// Auth0 imports
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();

  const { logout } = useAuth0();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col justify-between">
      <div>
        <div className="p-4 text-center text-xl font-bold border-b border-gray-700">
          My Dashboard
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                to="/dashboard"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("overview")}
              </Link>
            </li>
            <li>
              <Link
                to="donators"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("donators")}
              </Link>
            </li>
            <li>
              <Link
                to="donations"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("donations")}
              </Link>
            </li>
            <li>
              <Link
                to="email"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("email")}
              </Link>
            </li>
            <li>
              <Link
                to="whatsapp"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                WhatsApp
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <ul>
          <li>
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-700 transition"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              {t("logout")}
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
