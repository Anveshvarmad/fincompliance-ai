import {
  CircleDot,
  Database,
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";

import {
  auditEvents,
} from "../data/mockData";


export default function AuditPage() {

  return (
    <>

      <PageHeader
        eyebrow="FORENSIC LEDGER"
        title="Audit trail"
        description="Follow every important event across
        transaction processing, risk analysis and AI."
      />


      <section className="audit-layout">

        <div className="audit-summary">

          <Database size={22} />

          <strong>
            MongoDB Event Store
          </strong>

          <span>
            Immutable-style operational history
          </span>

          <div className="audit-stat">

            <b>
              24,821
            </b>

            <small>
              EVENTS TODAY
            </small>

          </div>

        </div>


        <div className="timeline">

          {auditEvents.map(
            (event, index) => (

              <div
                className="timeline-item"
                key={
                  event.type
                  + event.time
                }
              >

                <div className="timeline-marker">

                  <CircleDot size={17} />

                  {
                    index
                    < auditEvents.length - 1
                    && (
                      <div className="timeline-line" />
                    )
                  }

                </div>


                <div className="timeline-content">

                  <div>

                    <strong>
                      {event.type}
                    </strong>

                    <span>
                      {event.service}
                    </span>

                  </div>

                  <div>

                    <strong>
                      {event.transaction}
                    </strong>

                    <span>
                      {event.time}
                    </span>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>

    </>
  );
}
