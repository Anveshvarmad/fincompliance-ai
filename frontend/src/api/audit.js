const EVENT_API_URL =
  import.meta.env.VITE_EVENT_API_URL ||
  "http://localhost:3001";


export class AuditAPIError extends Error {

  constructor(
    message,
    status = 500,
  ) {

    super(message);

    this.name =
      "AuditAPIError";

    this.status =
      status;
  }
}


export async function getAuditEvents({
  transactionRef = "",
  eventType = "",
  limit = 100,
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "limit",
    String(limit)
  );


  if (transactionRef) {

    params.set(
      "transaction_ref",
      transactionRef
    );
  }


  if (eventType) {

    params.set(
      "event_type",
      eventType
    );
  }


  const response =
    await fetch(
      `${EVENT_API_URL}/events?${params.toString()}`
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new AuditAPIError(
      data?.detail ||
      "Audit events could not be loaded.",
      response.status,
    );
  }


  return data;
}


export async function getAuditHealth() {

  const response =
    await fetch(
      `${EVENT_API_URL}/health`
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new AuditAPIError(
      "Event service is unavailable.",
      response.status,
    );
  }


  return data;
}
