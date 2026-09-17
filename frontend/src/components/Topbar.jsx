import {
  Bell,
  Command,
  LogOut,
  Search,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";


export default function Topbar() {

  const {
    user,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  function signOut() {

    logout();

    navigate(
      "/login",
      {
        replace:
          true,
      }
    );
  }


  const initials =
    user?.username
      ?.slice(
        0,
        2
      )
      .toUpperCase()
    || "FC";


  return (
    <header className="topbar">

      <div className="search-shell">

        <Search size={16} />

        <input
          placeholder="Search transactions, policies, customers..."
        />

        <span className="keyboard-hint">

          <Command size={13} />

          K

        </span>

      </div>


      <div className="topbar-actions">

        <button className="icon-button">

          <Bell size={17} />

        </button>


        <div className="environment-pill">

          <span />

          SECURE

        </div>


        <div className="topbar-user">

          <div>

            <strong>
              {
                user?.username
                || "User"
              }
            </strong>

            <span>
              {
                user?.role
                  ?.toUpperCase()
                || "VIEWER"
              }
            </span>

          </div>


          <div className="avatar">
            {initials}
          </div>

        </div>


        <button
          className="icon-button"
          title="Sign out"
          onClick={
            signOut
          }
        >

          <LogOut size={16} />

        </button>

      </div>

    </header>
  );
}
