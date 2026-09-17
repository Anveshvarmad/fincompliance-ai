import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileClock,
  Filter,
  Fingerprint,
  LoaderCircle,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  TerminalSquare,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader
  from "../components/PageHeader";

import {
  getAuditEvents,
  getAuditHealth,
} from "../api/audit";


function formatDateTime(
  value
) {

  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}


function formatEventName(
  value = ""
) {

  return value
    .split("_")
    .map(
      word =>
        word.charAt(0)
          .toUpperCase()
        + word
          .slice(1)
          .toLowerCase()
    )
    .join(" ");
}


function eventConfig(
  type
) {

  switch (type) {

    case "TRANSACTION_CREATED":

      return {
        icon:
          Fingerprint,

        className:
          "transaction",

        label:
          "Transaction",
      };


    case "RISK_ASSESSMENT_CREATED":

      return {
        icon:
          ShieldCheck,

        className:
          "risk",

        label:
          "Risk Engine",
      };


    case "AI_EXPLANATION_CREATED":

      return {
        icon:
          BrainCircuit,

        className:
          "ai",

        label:
          "AI Intelligence",
      };


    default:

      return {
        icon:
          Activity,

        className:
          "generic",

        label:
          "System",
      };
  }
}


function PayloadView({
  payload,
}) {

  if (
    !payload
    ||
    Object.keys(
      payload
    ).length === 0
  ) {

    return (
      <span className="audit-empty-payload">
        No event payload.
      </span>
    );
  }


  return (
    <div className="audit-payload-grid">

      {
        Object.entries(
          payload
        ).map(
          ([
            key,
            value,
          ]) => (

            <div
              key={key}
            >

              <span>
                {
                  key
                    .split("_")
                    .join(" ")
                    .toUpperCase()
                }
              </span>

              <strong>

                {
                  Array.isArray(
                    value
                  )
                    ? value.join(
                        ", "
                      )
                    : typeof value
                      === "object"
                    ? JSON.stringify(
                        value
                      )
                    : String(
                        value
                      )
                }

              </strong>

            </div>

          )
        )
      }

    </div>
  );
}


export default function AuditPage() {

  const [
    events,
    setEvents,
  ] = useState([]);


  const [
    total,
    setTotal,
  ] = useState(0);


  const [
    serviceHealth,
    setServiceHealth,
  ] = useState(null);


  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState(null);


  const [
    transactionSearch,
    setTransactionSearch,
  ] = useState("");


  const [
    eventType,
    setEventType,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  const loadAuditData =
    useCallback(
      async () => {

        setLoading(true);
        setError(null);


        try {

          const [
            eventData,
            healthData,
          ] =
            await Promise.all([
              getAuditEvents({
                limit: 100,
              }),

              getAuditHealth(),
            ]);


          const items =
            eventData.items
            || [];


          setEvents(
            items
          );

          setTotal(
            eventData.total
            || 0
          );

          setServiceHealth(
            healthData
          );


          setSelectedEvent(
            current => {

              if (
                current
                &&
                items.some(
                  item =>
                    item.event_id
                    === current.event_id
                )
              ) {

                return current;
              }


              return (
                items[0]
                || null
              );
            }
          );

        } catch (err) {

          setError(
            err.message
            || "Audit history could not be loaded."
          );

        } finally {

          setLoading(false);
        }

      },
      []
    );


  useEffect(
    () => {

      loadAuditData();

    },
    [loadAuditData]
  );


  const eventTypes =
    useMemo(
      () => {

        return [
          ...new Set(
            events
              .map(
                event =>
                  event.event_type
              )
              .filter(Boolean)
          ),
        ];

      },
      [events]
    );


  const filteredEvents =
    useMemo(
      () => {

        const search =
          transactionSearch
            .trim()
            .toLowerCase();


        return events.filter(
          event => {

            const matchesSearch =
              !search
              ||
              event
                .transaction_ref
                ?.toLowerCase()
                .includes(search)
              ||
              event
                .event_id
                ?.toLowerCase()
                .includes(search)
              ||
              event
                .source
                ?.toLowerCase()
                .includes(search);


            const matchesType =
              !eventType
              ||
              event.event_type
              === eventType;


            return (
              matchesSearch
              &&
              matchesType
            );
          }
        );

      },
      [
        events,
        transactionSearch,
        eventType,
      ]
    );


  const counts =
    useMemo(
      () => {

        const result = {
          transaction: 0,
          risk: 0,
          ai: 0,
        };


        events.forEach(
          event => {

            if (
              event.event_type
              === "TRANSACTION_CREATED"
            ) {
              result.transaction += 1;
            }


            if (
              event.event_type
              === "RISK_ASSESSMENT_CREATED"
            ) {
              result.risk += 1;
            }


            if (
              event.event_type
              === "AI_EXPLANATION_CREATED"
            ) {
              result.ai += 1;
            }
          }
        );


        return result;

      },
      [events]
    );


  const uniqueTransactions =
    useMemo(
      () => {

        return new Set(
          events
            .map(
              event =>
                event.transaction_ref
            )
            .filter(Boolean)
        ).size;

      },
      [events]
    );


  return (
    <>

      <PageHeader
        eyebrow="FORENSIC LEDGER"
        title="Audit trail"
        description="Trace the operational history of transactions, deterministic risk assessments and grounded AI explanations through the live Node.js and MongoDB event layer."
      >

        <button
          className="secondary-button audit-refresh-button"
          onClick={
            loadAuditData
          }
          disabled={
            loading
          }
        >

          <RefreshCw
            size={15}
          />

          Refresh

        </button>

      </PageHeader>


      {error && (

        <div className="api-error">

          <strong>
            Audit service unavailable
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      <section className="audit-system-banner">

        <div className="audit-system-identity">

          <div className="audit-database-orbit">

            <div className="audit-db-ring ring-one" />
            <div className="audit-db-ring ring-two" />

            <div className="audit-db-core">

              <Database
                size={22}
              />

            </div>

          </div>


          <div>

            <span className="panel-label">
              EVENT INFRASTRUCTURE
            </span>

            <h2>
              MongoDB Audit Stream
            </h2>

            <p>
              Flexible event documents from the Node.js
              event service provide an append-oriented
              operational history across the application.
            </p>

          </div>

        </div>


        <div className="audit-service-state">

          <div
            className={
              serviceHealth?.mongo
              === "up"
                ? "audit-health-dot online"
                : "audit-health-dot"
            }
          />


          <div>

            <span>
              EVENT SERVICE
            </span>

            <strong>

              {
                serviceHealth?.status
                === "up"
                ? "Operational"
                : "Unavailable"
              }

            </strong>

          </div>


          <Server size={18} />

        </div>

      </section>


      <section className="audit-metrics">

        <div>

          <FileClock size={17} />

          <span>
            TOTAL EVENTS
          </span>

          <strong>
            {
              total
                .toLocaleString()
            }
          </strong>

        </div>


        <div>

          <Fingerprint size={17} />

          <span>
            TRANSACTION EVENTS
          </span>

          <strong>
            {
              counts.transaction
            }
          </strong>

        </div>


        <div>

          <ShieldCheck size={17} />

          <span>
            RISK EVENTS
          </span>

          <strong>
            {
              counts.risk
            }
          </strong>

        </div>


        <div>

          <BrainCircuit size={17} />

          <span>
            AI EVENTS
          </span>

          <strong>
            {
              counts.ai
            }
          </strong>

        </div>


        <div>

          <Radio size={17} />

          <span>
            TRANSACTIONS IN VIEW
          </span>

          <strong>
            {
              uniqueTransactions
            }
          </strong>

        </div>

      </section>


      <section className="audit-filter-bar">

        <div className="audit-search">

          <Search size={15} />

          <input
            value={
              transactionSearch
            }
            onChange={
              event =>
                setTransactionSearch(
                  event.target.value
                )
            }
            placeholder="Search transaction, event ID or source..."
          />


          {
            transactionSearch
            && (
              <button
                onClick={
                  () =>
                    setTransactionSearch(
                      ""
                    )
                }
              >

                <X size={13} />

              </button>
            )
          }

        </div>


        <div className="audit-event-filter">

          <Filter size={14} />

          <select
            value={
              eventType
            }
            onChange={
              event =>
                setEventType(
                  event.target.value
                )
            }
          >

            <option value="">
              All event types
            </option>

            {
              eventTypes.map(
                type => (

                  <option
                    key={type}
                    value={type}
                  >

                    {
                      formatEventName(
                        type
                      )
                    }

                  </option>

                )
              )
            }

          </select>

        </div>


        <span className="audit-loaded-count">

          {
            filteredEvents.length
          }
          {" "}
          visible events

        </span>

      </section>


      {
        loading
        ? (

          <section className="audit-loading">

            <div className="audit-stream-loader">

              <span />
              <span />
              <span />
              <span />

            </div>

            <strong>
              Reading event stream
            </strong>

            <small>
              Node.js → MongoDB → React
            </small>

          </section>

        )
        : filteredEvents.length === 0
        ? (

          <section className="audit-loading">

            <TerminalSquare
              size={27}
            />

            <strong>
              No matching events
            </strong>

            <small>
              Change the search or event filter.
            </small>

          </section>

        )
        : (

          <section className="live-audit-workspace">

            <div className="audit-timeline-panel">

              <div className="audit-panel-heading">

                <div>

                  <span className="panel-label">
                    EVENT STREAM
                  </span>

                  <h3>
                    Recent activity
                  </h3>

                </div>


                <div className="audit-stream-live">

                  <span />

                  LIVE DATA

                </div>

              </div>


              <div className="live-audit-timeline">

                {
                  filteredEvents.map(
                    (
                      event,
                      index
                    ) => {

                      const config =
                        eventConfig(
                          event.event_type
                        );


                      const Icon =
                        config.icon;


                      const selected =
                        selectedEvent
                          ?.event_id
                        === event.event_id;


                      return (

                        <button
                          className={
                            selected
                              ? `live-audit-event selected ${config.className}`
                              : `live-audit-event ${config.className}`
                          }
                          key={
                            event.event_id
                          }
                          onClick={
                            () =>
                              setSelectedEvent(
                                event
                              )
                          }
                        >

                          <div className="audit-event-rail">

                            <div className="audit-event-icon">

                              <Icon
                                size={15}
                              />

                            </div>


                            {
                              index
                              <
                              filteredEvents.length - 1
                              && (
                                <div className="audit-event-line" />
                              )
                            }

                          </div>


                          <div className="audit-event-main">

                            <div className="audit-event-top">

                              <div>

                                <span>
                                  {
                                    config.label
                                  }
                                </span>

                                <strong>
                                  {
                                    formatEventName(
                                      event.event_type
                                    )
                                  }
                                </strong>

                              </div>


                              <time>

                                {
                                  formatDateTime(
                                    event.occurred_at
                                  )
                                }

                              </time>

                            </div>


                            <div className="audit-event-bottom">

                              <span className="audit-event-transaction">

                                {
                                  event.transaction_ref
                                  || "NO TRANSACTION"
                                }

                              </span>


                              <span>
                                {
                                  event.source
                                }
                              </span>

                            </div>

                          </div>


                          <ChevronRight
                            size={15}
                          />

                        </button>

                      );
                    }
                  )
                }

              </div>

            </div>


            <aside className="audit-inspector">

              {
                selectedEvent
                && (() => {

                  const config =
                    eventConfig(
                      selectedEvent
                        .event_type
                    );


                  const Icon =
                    config.icon;


                  return (

                    <>
                      <div className="audit-inspector-header">

                        <div
                          className={
                            `audit-inspector-icon ${config.className}`
                          }
                        >

                          <Icon
                            size={21}
                          />

                        </div>


                        <div>

                          <span>
                            SELECTED EVENT
                          </span>

                          <strong>
                            {
                              formatEventName(
                                selectedEvent
                                  .event_type
                              )
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="audit-event-id">

                        <span>
                          EVENT ID
                        </span>

                        <strong>
                          {
                            selectedEvent
                              .event_id
                          }
                        </strong>

                      </div>


                      <div className="audit-inspector-grid">

                        <div>

                          <span>
                            TRANSACTION
                          </span>

                          <strong>
                            {
                              selectedEvent
                                .transaction_ref
                              || "—"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            SOURCE
                          </span>

                          <strong>
                            {
                              selectedEvent
                                .source
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            EVENT TIME
                          </span>

                          <strong>
                            {
                              formatDateTime(
                                selectedEvent
                                  .occurred_at
                              )
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            RECEIVED
                          </span>

                          <strong>
                            {
                              formatDateTime(
                                selectedEvent
                                  .received_at
                              )
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="audit-payload-section">

                        <div>

                          <TerminalSquare
                            size={14}
                          />

                          <span>
                            EVENT PAYLOAD
                          </span>

                        </div>


                        <PayloadView
                          payload={
                            selectedEvent
                              .payload
                          }
                        />

                      </div>


                      <div className="audit-architecture-note">

                        <Database
                          size={16}
                        />

                        <div>

                          <strong>
                            Stored in MongoDB
                          </strong>

                          <span>
                            Event payloads can vary by event
                            type without forcing every event
                            into one relational schema.
                          </span>

                        </div>

                      </div>


                      <div className="audit-event-integrity">

                        <CheckCircle2
                          size={15}
                        />

                        <div>

                          <strong>
                            Unique event identifier
                          </strong>

                          <span>
                            Duplicate event IDs are rejected
                            by the MongoDB unique index.
                          </span>

                        </div>

                      </div>

                    </>

                  );

                })()
              }

            </aside>

          </section>

        )
      }

    </>
  );
}
