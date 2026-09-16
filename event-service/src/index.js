const express = require("express");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    application: "FinCompliance Event Service",
    phase: 1,
    message: "Event service is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "up",
    service: "event-service",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Event service listening on port ${PORT}`);
});
