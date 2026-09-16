import { Outlet } from "react-router-dom";

import AmbientBackground
  from "../components/AmbientBackground";

import Sidebar
  from "../components/Sidebar";

import Topbar
  from "../components/Topbar";


export default function AppLayout() {

  return (
    <div className="app-shell">

      <AmbientBackground />

      <Sidebar />

      <div className="workspace">

        <Topbar />

        <main className="page-container">

          <Outlet />

        </main>

      </div>

    </div>
  );
}
