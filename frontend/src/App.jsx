import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout
  from "./layouts/AppLayout";

import AIPage
  from "./pages/AIPage";

import AuditPage
  from "./pages/AuditPage";

import KnowledgePage
  from "./pages/KnowledgePage";

import OverviewPage
  from "./pages/OverviewPage";

import RiskPage
  from "./pages/RiskPage";

import TransactionsPage
  from "./pages/TransactionsPage";


export default function App() {

  return (
    <Routes>

      <Route
        element={<AppLayout />}
      >

        <Route
          path="/"
          element={
            <Navigate
              to="/overview"
              replace
            />
          }
        />

        <Route
          path="/overview"
          element={<OverviewPage />}
        />

        <Route
          path="/transactions"
          element={<TransactionsPage />}
        />

        <Route
          path="/risk"
          element={<RiskPage />}
        />

        <Route
          path="/knowledge"
          element={<KnowledgePage />}
        />

        <Route
          path="/ai"
          element={<AIPage />}
        />

        <Route
          path="/audit"
          element={<AuditPage />}
        />

      </Route>

    </Routes>
  );
}
