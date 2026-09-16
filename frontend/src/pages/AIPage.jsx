import {
  Brain,
  CheckCircle2,
  FileSearch,
  Sparkles,
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";


export default function AIPage() {

  return (
    <>

      <PageHeader
        eyebrow="GROUNDED INTELLIGENCE"
        title="AI compliance analysis"
        description="Human-readable explanations grounded
        in deterministic rules and retrieved policy context."
      />


      <section className="ai-workspace">

        <div className="ai-context-panel">

          <span className="panel-label">
            ANALYSIS CONTEXT
          </span>

          <div className="context-transaction">

            <small>
              TRANSACTION
            </small>

            <strong>
              TXN-A841F220
            </strong>

            <span>
              $22,500 · US → SG
            </span>

          </div>


          <div className="context-score">

            <small>
              FIXED RISK SCORE
            </small>

            <strong>
              65
            </strong>

            <span>
              HIGH
            </span>

          </div>


          <div className="context-source">

            <CheckCircle2 size={17} />

            Deterministic assessment locked

          </div>

        </div>


        <div className="ai-response-panel">

          <div className="ai-response-header">

            <div className="ai-avatar">
              <Brain size={20} />
            </div>

            <div>

              <strong>
                Compliance Intelligence
              </strong>

              <span>
                gemma3:4b · grounded response
              </span>

            </div>

            <Sparkles size={17} />

          </div>


          <div className="ai-section">

            <small>
              SUMMARY
            </small>

            <p>
              This transaction received a high-risk
              classification because multiple
              independent monitoring indicators
              were triggered.
            </p>

          </div>


          <div className="ai-section">

            <small>
              RATIONALE
            </small>

            <p>
              The transaction exceeds the high-value
              threshold, crosses jurisdictions and
              uses a wire-transfer channel. Retrieved
              policy guidance indicates these factors
              may warrant enhanced review when they
              occur together.
            </p>

          </div>


          <div className="ai-section recommendation">

            <small>
              RECOMMENDED ACTION
            </small>

            <p>
              Route for manual review and verify the
              transaction purpose and customer context
              before making a final determination.
            </p>

          </div>


          <div className="source-row">

            <FileSearch size={16} />

            <span>
              Grounded in 4 retrieved policy chunks
            </span>

          </div>

        </div>

      </section>

    </>
  );
}
