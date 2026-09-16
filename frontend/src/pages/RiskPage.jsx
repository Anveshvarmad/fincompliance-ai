import {
  AlertOctagon,
  ArrowRight,
  Globe2,
  Radio,
  WalletCards,
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";


const rules = [
  {
    icon: WalletCards,
    title: "High-value transaction",
    description: "Amount exceeds $10,000",
    points: "+30",
  },
  {
    icon: Globe2,
    title: "Cross-border activity",
    description: "US → Singapore",
    points: "+20",
  },
  {
    icon: Radio,
    title: "Wire transfer channel",
    description: "Enhanced monitoring required",
    points: "+15",
  },
];


export default function RiskPage() {

  return (
    <>

      <PageHeader
        eyebrow="DETERMINISTIC ENGINE"
        title="Risk analysis laboratory"
        description="Understand exactly why a transaction
        received its risk classification."
      />


      <section className="risk-lab">

        <div className="risk-score-stage">

          <div className="radar-lines" />

          <div className="risk-gauge">

            <div className="gauge-ring">

              <div className="gauge-center">

                <span>
                  RISK SCORE
                </span>

                <strong>
                  65
                </strong>

                <small>
                  HIGH
                </small>

              </div>

            </div>

          </div>


          <div className="risk-transaction">

            <span>
              TXN-A841F220
            </span>

            <strong>
              $22,500.00
            </strong>

            <small>
              US → SG · Wire Transfer
            </small>

          </div>

        </div>


        <div className="risk-rules">

          <span className="panel-label">
            RULE BREAKDOWN
          </span>

          <h3>
            Three indicators matched
          </h3>


          {rules.map(
            ({
              icon: Icon,
              title,
              description,
              points,
            }) => (

              <div
                className="rule-card"
                key={title}
              >

                <div className="rule-icon">
                  <Icon size={18} />
                </div>

                <div>

                  <strong>
                    {title}
                  </strong>

                  <span>
                    {description}
                  </span>

                </div>

                <b>
                  {points}
                </b>

              </div>

            )
          )}


          <div className="score-equation">

            <span>
              30 + 20 + 15
            </span>

            <ArrowRight size={18} />

            <strong>
              65 HIGH
            </strong>

          </div>


          <div className="explainability-note">

            <AlertOctagon size={18} />

            <p>
              Risk score is generated entirely
              from deterministic rules. AI cannot
              alter this score.
            </p>

          </div>

        </div>

      </section>

    </>
  );
}
