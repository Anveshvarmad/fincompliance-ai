import {
  Activity,
  BrainCircuit,
  DatabaseZap,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";


const links = [
  {
    path: "/overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/transactions",
    label: "Transactions",
    icon: DatabaseZap,
  },
  {
    path: "/risk",
    label: "Risk Engine",
    icon: ShieldCheck,
  },
  {
    path: "/knowledge",
    label: "Knowledge",
    icon: BrainCircuit,
  },
  {
    path: "/ai",
    label: "AI Analysis",
    icon: Activity,
  },
  {
    path: "/audit",
    label: "Audit Trail",
    icon: ScrollText,
  },
];


export default function Sidebar() {

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-mark">
          F
        </div>

        <div>
          <strong>
            FINCOMPLIANCE
          </strong>

          <span>
            Intelligence OS
          </span>
        </div>

      </div>


      <nav className="nav-list">

        {links.map(
          ({
            path,
            label,
            icon: Icon,
          }) => (

            <NavLink
              key={path}
              to={path}
              className={
                ({ isActive }) =>
                  isActive
                    ? "nav-item active"
                    : "nav-item"
              }
            >

              <Icon size={18} />

              <span>
                {label}
              </span>

            </NavLink>

          )
        )}

      </nav>


      <div className="sidebar-status">

        <div className="status-dot" />

        <div>

          <span>
            SYSTEM STATUS
          </span>

          <strong>
            All services operational
          </strong>

        </div>

      </div>

    </aside>
  );
}
