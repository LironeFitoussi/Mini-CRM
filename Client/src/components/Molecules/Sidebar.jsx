import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import LanguageSwitcher from "./LanguageSwitcher";
const Sidebar = () => {
  const { t } = useTranslation();
  const { logout } = useAuth0();
  const queryClient = useQueryClient();

  // Access cached user data directly
  const userdata = queryClient.getQueryData(["userdata"]);

  // console.log(userdata);

  return (
    <aside className=" bg-gray-800 text-white flex flex-col justify-between min-w-36">
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
                to="tasks"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("tasks")}
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
            {/* <li>
              <Link
                to="donations"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("donations")}
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="email"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                {t("email")}
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="whatsapp"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                WhatsApp
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="sms"
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                SMS
              </Link>
            </li> */}
            {userdata.role === "admin" || userdata.role === "developer" ? (
              <li>
                <Link
                  to="users"
                  className="block px-4 py-2 hover:bg-gray-700 transition"
                >
                  {t("userManagementUsers")}
                </Link>
              </li>
            ) : null}
            <div>
              <LanguageSwitcher />
            </div>
          </ul>
        </nav>
      </div>
      <div>
        <div className="mt-4 flex flex-col gap-2 justify-center align-middle text-center mb-6">
          <div className="flex justify-center">
            <button
              className="block px-4 py-2 text-left hover:bg-gray-700 transition bg-red-500 rounded-sm w-min"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
