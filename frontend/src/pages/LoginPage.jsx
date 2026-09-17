import {
  ArrowRight,
  BrainCircuit,
  Database,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";


export default function LoginPage() {

  const {
    login,
    isAuthenticated,
  } = useAuth();


  const navigate =
    useNavigate();


  const location =
    useLocation();


  const [
    username,
    setUsername,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  if (
    isAuthenticated
  ) {

    return (
      <Navigate
        to="/overview"
        replace
      />
    );
  }


  async function submit(
    event
  ) {

    event.preventDefault();

    setLoading(true);
    setError(null);


    try {

      await login(
        username,
        password,
      );


      navigate(
        location.state?.from
        || "/overview",
        {
          replace:
            true,
        },
      );

    } catch (err) {

      setError(
        err.message
        || "Authentication failed."
      );

    } finally {

      setLoading(false);
    }
  }


  return (
    <main className="security-login-page">

      <div className="security-login-grid" />

      <div className="security-login-orb security-orb-one" />
      <div className="security-login-orb security-orb-two" />


      <section className="security-brand-panel">

        <div className="security-brand-mark">
          F
        </div>


        <span className="panel-label">
          FINCOMPLIANCE INTELLIGENCE OS
        </span>


        <h1>
          Secure access to
          financial intelligence.
        </h1>


        <p>
          Authentication now sits in front of
          transaction, compliance, knowledge,
          AI and operational APIs.
        </p>


        <div className="security-feature-list">

          <div>

            <ShieldCheck size={18} />

            <span>
              Role-based access control
            </span>

          </div>


          <div>

            <KeyRound size={18} />

            <span>
              Signed JWT access tokens
            </span>

          </div>


          <div>

            <BrainCircuit size={18} />

            <span>
              Protected AI workflows
            </span>

          </div>


          <div>

            <Database size={18} />

            <span>
              Auditable backend access
            </span>

          </div>

        </div>

      </section>


      <section className="security-login-card">

        <div className="login-card-icon">

          <LockKeyhole
            size={21}
          />

        </div>


        <span className="panel-label">
          AUTHENTICATION
        </span>


        <h2>
          Sign in
        </h2>


        <p>
          Use your local development
          FinCompliance credentials.
        </p>


        <form
          onSubmit={
            submit
          }
        >

          <label>

            <span>
              USERNAME
            </span>

            <input
              autoComplete="username"
              value={
                username
              }
              onChange={
                event =>
                  setUsername(
                    event.target.value
                  )
              }
              placeholder="analyst"
              required
            />

          </label>


          <label>

            <span>
              PASSWORD
            </span>

            <input
              type="password"
              autoComplete="current-password"
              value={
                password
              }
              onChange={
                event =>
                  setPassword(
                    event.target.value
                  )
              }
              placeholder="••••••••••••"
              required
            />

          </label>


          {
            error
            && (
              <div className="security-login-error">
                {error}
              </div>
            )
          }


          <button
            type="submit"
            disabled={
              loading
            }
          >

            {
              loading
                ? (
                  <LoaderCircle
                    className="spin-icon"
                    size={17}
                  />
                )
                : (
                  <KeyRound
                    size={17}
                  />
                )
            }

            {
              loading
                ? "Authenticating..."
                : "Enter Command Center"
            }

            {
              !loading
              && (
                <ArrowRight
                  size={16}
                />
              )
            }

          </button>

        </form>


        <div className="login-role-note">

          <strong>
            Roles
          </strong>

          <span>
            Viewer → read access
          </span>

          <span>
            Analyst → risk + AI operations
          </span>

          <span>
            Admin → full privileged role
          </span>

        </div>

      </section>

    </main>
  );
}
