import { useEffect, useState } from "react";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


function App() {

  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {

    fetch(`${API_URL}/health`)
      .then((response) => {

        if (!response.ok) {
          throw new Error("Backend health request failed");
        }

        return response.json();
      })
      .then((data) => {
        setHealth(data);
      })
      .catch((err) => {
        setError(err.message);
      });

  }, []);


  return (
    <main className="container">

      <h1>FinCompliance AI</h1>

      <p>
        AI-powered financial compliance demo platform
      </p>

      <h2>Phase 1 Infrastructure</h2>


      {error && (
        <div className="error">
          {error}
        </div>
      )}


      {!health && !error && (
        <p>Checking services...</p>
      )}


      {health && (
        <div className="services">

          {
            Object.entries(health.services)
              .map(([service, status]) => (

                <div
                  key={service}
                  className="service-card"
                >

                  <strong>
                    {service}
                  </strong>

                  <span>
                    {status}
                  </span>

                </div>

              ))
          }

        </div>
      )}

    </main>
  );
}


export default App;
