import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute
  from "./auth/ProtectedRoute";

import AppLayout
  from "./layouts/AppLayout";

import AIPage
  from "./pages/AIPage";

import AuditPage
  from "./pages/AuditPage";

import KnowledgePage
  from "./pages/KnowledgePage";

import LoginPage
  from "./pages/LoginPage";

import OverviewPage
  from "./pages/OverviewPage";

import RiskPage
  from "./pages/RiskPage";

import TransactionDetailPage
  from "./pages/TransactionDetailPage";

import TransactionsPage
  from "./pages/TransactionsPage";


export default function App() {

  return (
    <Routes>

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />


      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <AppLayout />
          }
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
            element={
              <OverviewPage />
            }
          />


          <Route
            path="/transactions"
            element={
              <TransactionsPage />
            }
          />


          <Route
            path="/transactions/:transactionRef"
            element={
              <TransactionDetailPage />
            }
          />


          <Route
            path="/risk"
            element={
              <RiskPage />
            }
          />


          <Route
            path="/knowledge"
            element={
              <KnowledgePage />
            }
          />


          <Route
            path="/ai"
            element={
              <AIPage />
            }
          />


          <Route
            path="/audit"
            element={
              <AuditPage />
            }
          />

        </Route>

      </Route>


      <Route
        path="*"
        element={
          <Navigate
            to="/overview"
            replace
          />
        }
      />

    </Routes>
  );
}
