const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

const PORT = Number(process.env.PORT || 3001);

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://mongo:27017";

const MONGO_DB =
  process.env.MONGO_DB ||
  "fincompliance";

const COLLECTION_NAME = "audit_events";

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigin =
    process.env.CORS_ORIGIN ||
    "http://localhost:5173";

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

let mongoClient;
let db;
let eventsCollection;


async function connectToMongo() {
  mongoClient = new MongoClient(MONGO_URL);

  await mongoClient.connect();

  db = mongoClient.db(MONGO_DB);

  eventsCollection =
    db.collection(COLLECTION_NAME);

  await eventsCollection.createIndex(
    { event_id: 1 },
    { unique: true }
  );

  await eventsCollection.createIndex({
    transaction_ref: 1,
    occurred_at: -1,
  });

  await eventsCollection.createIndex({
    event_type: 1,
    occurred_at: -1,
  });

  console.log(
    `Connected to MongoDB database: ${MONGO_DB}`
  );
}


app.get("/", (req, res) => {
  res.json({
    application:
      "FinCompliance Event Service",

    purpose:
      "Audit and event storage",

    database:
      "MongoDB",

    status:
      "running",
  });
});


app.get("/health", async (req, res) => {
  try {
    await db.command({ ping: 1 });

    res.json({
      status: "up",
      service: "event-service",
      mongo: "up",
      timestamp:
        new Date().toISOString(),
    });

  } catch (error) {

    res.status(503).json({
      status: "down",
      service: "event-service",
      mongo: "down",
      error: error.message,
      timestamp:
        new Date().toISOString(),
    });
  }
});


app.post("/events", async (req, res) => {
  try {
    const {
      event_id,
      event_type,
      transaction_ref,
      source,
      occurred_at,
      payload,
    } = req.body;


    if (
      !event_id ||
      !event_type ||
      !source ||
      !occurred_at
    ) {
      return res.status(400).json({
        detail:
          "event_id, event_type, source, and occurred_at are required.",
      });
    }


    const eventDocument = {
      event_id,
      event_type,

      transaction_ref:
        transaction_ref || null,

      source,

      occurred_at:
        new Date(occurred_at),

      received_at:
        new Date(),

      payload:
        payload || {},
    };


    const result =
      await eventsCollection.insertOne(
        eventDocument
      );


    const created =
      await eventsCollection.findOne({
        _id: result.insertedId,
      });


    return res.status(201).json({
      id:
        created._id.toString(),

      event_id:
        created.event_id,

      event_type:
        created.event_type,

      transaction_ref:
        created.transaction_ref,

      source:
        created.source,

      occurred_at:
        created.occurred_at,

      received_at:
        created.received_at,

      payload:
        created.payload,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        detail:
          "Event with this event_id already exists.",
      });
    }


    console.error(
      "Failed to create event:",
      error
    );


    return res.status(500).json({
      detail:
        "Event could not be stored.",
    });
  }
});


app.get("/events", async (req, res) => {
  try {
    const {
      transaction_ref,
      event_type,
    } = req.query;


    const limit = Math.min(
      Math.max(
        Number(req.query.limit || 20),
        1
      ),
      100
    );


    const filter = {};


    if (transaction_ref) {
      filter.transaction_ref =
        transaction_ref;
    }


    if (event_type) {
      filter.event_type =
        event_type;
    }


    const total =
      await eventsCollection.countDocuments(
        filter
      );


    const events =
      await eventsCollection
        .find(filter)
        .sort({
          occurred_at: -1,
        })
        .limit(limit)
        .toArray();


    return res.json({
      total,
      limit,

      items: events.map(
        (event) => ({
          id:
            event._id.toString(),

          event_id:
            event.event_id,

          event_type:
            event.event_type,

          transaction_ref:
            event.transaction_ref,

          source:
            event.source,

          occurred_at:
            event.occurred_at,

          received_at:
            event.received_at,

          payload:
            event.payload,
        })
      ),
    });

  } catch (error) {

    console.error(
      "Failed to retrieve events:",
      error
    );


    return res.status(500).json({
      detail:
        "Events could not be retrieved.",
    });
  }
});


app.get(
  "/events/:eventId",
  async (req, res) => {

    try {

      const event =
        await eventsCollection.findOne({
          event_id:
            req.params.eventId,
        });


      if (!event) {

        return res.status(404).json({
          detail:
            "Event not found.",
        });
      }


      return res.json({
        id:
          event._id.toString(),

        event_id:
          event.event_id,

        event_type:
          event.event_type,

        transaction_ref:
          event.transaction_ref,

        source:
          event.source,

        occurred_at:
          event.occurred_at,

        received_at:
          event.received_at,

        payload:
          event.payload,
      });

    } catch (error) {

      console.error(
        "Failed to retrieve event:",
        error
      );


      return res.status(500).json({
        detail:
          "Event could not be retrieved.",
      });
    }
  }
);


async function startServer() {

  try {

    await connectToMongo();


    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          `Event service listening on port ${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      "Could not start event service:",
      error
    );

    process.exit(1);
  }
}


async function shutdown() {

  console.log(
    "Shutting down event service..."
  );

  if (mongoClient) {
    await mongoClient.close();
  }

  process.exit(0);
}


process.on(
  "SIGTERM",
  shutdown
);

process.on(
  "SIGINT",
  shutdown
);


startServer();
