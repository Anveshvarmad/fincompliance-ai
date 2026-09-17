const express =
  require("express");

const {
  MongoClient,
} =
  require("mongodb");

const amqp =
  require("amqplib");


const PORT =
  Number(
    process.env.PORT
    || 3001
  );


const MONGO_URL =
  process.env.MONGO_URL
  || "mongodb://mongo:27017";


const MONGO_DB =
  process.env.MONGO_DB
  || "fincompliance";


const RABBITMQ_URL =
  process.env.RABBITMQ_URL;


const QUEUE_NAME =
  process.env.RABBITMQ_QUEUE
  || "compliance.audit.events";


const app =
  express();


app.use(
  express.json()
);


app.use(
  (
    req,
    res,
    next
  ) => {

    const origin =
      process.env.CORS_ORIGIN
      || "http://localhost:5173";


    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );


    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,OPTIONS"
    );


    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );


    if (
      req.method
      === "OPTIONS"
    ) {

      return res.sendStatus(
        204
      );
    }


    next();
  }
);


let mongoClient;
let db;
let eventsCollection;

let rabbitConnection;
let rabbitChannel;

let rabbitReady =
  false;


async function connectMongo() {

  mongoClient =
    new MongoClient(
      MONGO_URL
    );


  await mongoClient.connect();


  db =
    mongoClient.db(
      MONGO_DB
    );


  eventsCollection =
    db.collection(
      "audit_events"
    );


  await eventsCollection.createIndex(
    {
      event_id:
        1,
    },
    {
      unique:
        true,
    }
  );


  await eventsCollection.createIndex(
    {
      transaction_ref:
        1,

      occurred_at:
        -1,
    }
  );


  await eventsCollection.createIndex(
    {
      event_type:
        1,

      occurred_at:
        -1,
    }
  );


  console.log(
    "MongoDB connected"
  );
}


async function storeEvent(
  event
) {

  const document = {
    event_id:
      event.event_id,

    event_type:
      event.event_type,

    transaction_ref:
      event.transaction_ref
      || null,

    source:
      event.source,

    occurred_at:
      new Date(
        event.occurred_at
      ),

    received_at:
      new Date(),

    payload:
      event.payload
      || {},
  };


  try {

    await eventsCollection.insertOne(
      document
    );


    return {
      inserted:
        true,

      duplicate:
        false,
    };


  } catch (error) {

    if (
      error.code
      === 11000
    ) {

      return {
        inserted:
          false,

        duplicate:
          true,
      };
    }


    throw error;
  }
}


async function startRabbitConsumer() {

  if (!RABBITMQ_URL) {

    console.log(
      "RABBITMQ_URL not configured"
    );

    return;
  }


  while (true) {

    try {

      rabbitConnection =
        await amqp.connect(
          RABBITMQ_URL
        );


      rabbitChannel =
        await rabbitConnection.createChannel();


      await rabbitChannel.assertQueue(
        QUEUE_NAME,
        {
          durable:
            true,
        }
      );


      rabbitChannel.prefetch(
        10
      );


      rabbitReady =
        true;


      console.log(
        `RabbitMQ consumer ready: ${QUEUE_NAME}`
      );


      rabbitConnection.on(
        "close",
        () => {

          rabbitReady =
            false;

          console.error(
            "RabbitMQ connection closed"
          );

          setTimeout(
            startRabbitConsumer,
            3000
          );
        }
      );


      rabbitConnection.on(
        "error",
        error => {

          rabbitReady =
            false;

          console.error(
            "RabbitMQ error",
            error.message
          );
        }
      );


      await rabbitChannel.consume(
        QUEUE_NAME,

        async message => {

          if (!message) {
            return;
          }


          try {

            const event =
              JSON.parse(
                message.content
                  .toString()
              );


            const result =
              await storeEvent(
                event
              );


            if (
              result.duplicate
            ) {

              console.log(
                `Duplicate event ignored: ${event.event_id}`
              );
            }


            rabbitChannel.ack(
              message
            );


          } catch (error) {

            console.error(
              "Rabbit consumer error",
              error
            );


            if (
              error instanceof SyntaxError
            ) {

              rabbitChannel.nack(
                message,
                false,
                false
              );

            } else {

              rabbitChannel.nack(
                message,
                false,
                true
              );
            }
          }
        },
        {
          noAck:
            false,
        }
      );


      return;


    } catch (error) {

      rabbitReady =
        false;


      console.error(
        "RabbitMQ connection failed:",
        error.message
      );


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            3000
          )
      );
    }
  }
}


app.get(
  "/",
  (
    req,
    res
  ) => {

    res.json({
      service:
        "fincompliance-event-service",

      architecture:
        "RabbitMQ consumer + MongoDB audit store",
    });
  }
);


app.get(
  "/health",
  async (
    req,
    res
  ) => {

    let mongo =
      "down";


    try {

      await db.command({
        ping:
          1,
      });

      mongo =
        "up";

    } catch {
      mongo =
        "down";
    }


    const healthy =
      mongo === "up"
      && rabbitReady;


    res.status(
      healthy
        ? 200
        : 503
    )
    .json({
      status:
        healthy
          ? "up"
          : "degraded",

      mongo,

      rabbitmq:
        rabbitReady
          ? "up"
          : "down",

      queue:
        QUEUE_NAME,
    });
  }
);


app.post(
  "/events",
  async (
    req,
    res
  ) => {

    const event =
      req.body;


    if (
      !event.event_id
      ||
      !event.event_type
      ||
      !event.source
      ||
      !event.occurred_at
    ) {

      return res.status(
        400
      )
      .json({
        detail:
          "event_id, event_type, source and occurred_at are required",
      });
    }


    try {

      const result =
        await storeEvent(
          event
        );


      if (
        result.duplicate
      ) {

        return res.status(
          409
        )
        .json({
          detail:
            "Duplicate event_id",
        });
      }


      return res.status(
        201
      )
      .json({
        status:
          "stored",

        event_id:
          event.event_id,
      });


    } catch (error) {

      console.error(
        error
      );


      return res.status(
        500
      )
      .json({
        detail:
          "Failed to store event",
      });
    }
  }
);


app.get(
  "/events",
  async (
    req,
    res
  ) => {

    const filter = {};


    if (
      req.query
        .transaction_ref
    ) {

      filter.transaction_ref =
        req.query
          .transaction_ref;
    }


    if (
      req.query
        .event_type
    ) {

      filter.event_type =
        req.query
          .event_type;
    }


    const limit =
      Math.min(
        100,
        Math.max(
          1,
          Number(
            req.query.limit
            || 50
          )
        )
      );


    const [
      items,
      total,
    ] =
      await Promise.all([

        eventsCollection
          .find(
            filter
          )
          .sort({
            occurred_at:
              -1,
          })
          .limit(
            limit
          )
          .toArray(),

        eventsCollection
          .countDocuments(
            filter
          ),
      ]);


    res.json({
      total,
      items,
    });
  }
);


app.get(
  "/events/:eventId",
  async (
    req,
    res
  ) => {

    const event =
      await eventsCollection.findOne({
        event_id:
          req.params.eventId,
      });


    if (!event) {

      return res.status(
        404
      )
      .json({
        detail:
          "Event not found",
      });
    }


    res.json(
      event
    );
  }
);


async function shutdown() {

  console.log(
    "Shutting down event service..."
  );


  try {

    if (
      rabbitChannel
    ) {

      await rabbitChannel.close();
    }

  } catch {}


  try {

    if (
      rabbitConnection
    ) {

      await rabbitConnection.close();
    }

  } catch {}


  try {

    if (
      mongoClient
    ) {

      await mongoClient.close();
    }

  } catch {}


  process.exit(
    0
  );
}


process.on(
  "SIGTERM",
  shutdown
);

process.on(
  "SIGINT",
  shutdown
);


async function main() {

  await connectMongo();


  app.listen(
    PORT,
    () => {

      console.log(
        `Event service listening on ${PORT}`
      );
    }
  );


  startRabbitConsumer();
}


main().catch(
  error => {

    console.error(
      error
    );

    process.exit(
      1
    );
  }
);
