import {
  Bell,
  Command,
  Search,
} from "lucide-react";


export default function Topbar() {

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

          LIVE DEMO

        </div>

        <div className="avatar">
          AV
        </div>

      </div>

    </header>
  );
}
