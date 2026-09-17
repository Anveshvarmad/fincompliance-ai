import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Radio,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
  Zap,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import PageHeader
  from "../components/PageHeader";

import {
  getTransaction,
} from "../api/transactions";

import {
  analyzeTransaction,
  getAssessment,
} from "../api/compliance";


function formatMoney(
  amount,
  currency,
) {

  const value =
    Number(amount);

  try {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
      }
    ).format(value);

  } catch {

    return `${value.toFixed(2)} ${currency}`;
  }
}


function formatType(
  value = ""
) {

  return value
    .split("_")
    .map(
      word =>
        word.charAt(0)
          .toUpperCase()
        + word.slice(1)
    )
    .join(" ");
}


function formatDate(
  value
) {

  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
}


function riskClass(
  level
) {

  return (
    level?.toLowerCase()
    || "unassessed"
  );
}


function ruleIcon(
  ruleCode
) {

  if (
    ruleCode.includes(
      "CROSS_BORDER"
    )
  ) {
    return Globe2;
  }

  if (
    ruleCode.includes(
      "WIRE"
    )
  ) {
    return Radio;
  }

  if (
    ruleCode.includes(
      "CASH"
    )
  ) {
    return WalletCards;
  }

  if (
    ruleCode.includes(
      "COUNTRY"
    )
  ) {
    return UserRound;
  }

  return AlertTriangle;
}


export default function TransactionDetailPage() {

  const {
    transactionRef,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    transaction,
    setTransaction,
  ] = useState(null);


  const [
    assessment,
    setAssessment,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  const loadInvestigation =
    useCallback(
      async () => {

        setLoading(true);
        setError(null);

        try {

          const transactionData =
            await getTransaction(
              transactionRef
            );

          setTransaction(
            transactionData
          );


          try {

            const assessmentData =
              await getAssessment(
                transactionRef
              );

            setAssessment(
              assessmentData
            );

          } catch (
            assessmentError
          ) {

            if (
              assessmentError.status
              === 404
            ) {

              setAssessment(null);

            } else {

              throw assessmentError;
            }
          }

        } catch (err) {

          setError(
            err.message
            || "Investigation could not be loaded."
          );

        } finally {

          setLoading(false);
        }

      },
      [transactionRef]
    );


  useEffect(
    () => {

      loadInvestigation();

    },
    [loadInvestigation]
  );


  async function runAnalysis() {

    setAnalyzing(true);
    setError(null);

    try {

      const result =
        await analyzeTransaction(
          transactionRef
        );

      setAssessment(
        result
      );

    } catch (err) {

      setError(
        err.message
        || "Risk analysis failed."
      );

    } finally {

      setAnalyzing(false);
    }
  }


  if (loading) {

    return (
      <div className="investigation-loading">

        <LoaderCircle
          size={30}
          className="spin-icon"
        />

        <strong>
          Opening investigation
        </strong>

        <span>
          Loading transaction and
          compliance context...
        </span>

      </div>
    );
  }


  if (
    error &&
    !transaction
  ) {

    return (
      <div className="investigation-error">

        <AlertTriangle size={26} />

        <strong>
          Investigation unavailable
        </strong>

        <span>
          {error}
        </span>

        <button
          onClick={
            () =>
              navigate(
                "/transactions"
              )
          }
        >

          Back to transactions

        </button>

      </div>
    );
  }


  const score =
    assessment?.risk_score
    ?? 0;


  const gaugeDegrees =
    Math.min(
      360,
      Math.max(
        0,
        score * 3.6
      )
    );


  return (
    <>

      <button
        className="investigation-back"
        onClick={
          () =>
            navigate(
              "/transactions"
            )
        }
      >

        <ArrowLeft size={15} />

        Transaction Explorer

      </button>


      <PageHeader
        eyebrow="LIVE INVESTIGATION"
        title="Transaction intelligence"
        description="Inspect transaction context,
        run deterministic compliance analysis,
        and understand exactly which rules
        contributed to the final risk score."
      >

        <button
          className="secondary-button investigation-refresh"
          onClick={
            loadInvestigation
          }
        >

          <RefreshCw size={15} />

          Refresh

        </button>

      </PageHeader>


      {error && (

        <div className="api-error">

          <strong>
            Request error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      <section className="investigation-hero">

        <div className="investigation-identity">

          <div className="investigation-id-row">

            <span className="live-data-indicator">

              <span />

              LIVE DATA

            </span>

            <span className="mono-reference">
              {
                transaction
                  .transaction_ref
              }
            </span>

          </div>


          <div className="investigation-amount">

            <small>
              TRANSACTION VALUE
            </small>

            <strong>

              {
                formatMoney(
                  transaction.amount,
                  transaction.currency,
                )
              }

            </strong>

          </div>


          <div className="transaction-route-large">

            <div>

              <small>
                ORIGIN
              </small>

              <strong>
                {
                  transaction
                    .origin_country
                }
              </strong>

            </div>


            <div className="route-line">

              <span />

              <ArrowRight size={17} />

            </div>


            <div>

              <small>
                DESTINATION
              </small>

              <strong>
                {
                  transaction
                    .destination_country
                }
              </strong>

            </div>

          </div>

        </div>


        <div className="investigation-meta-grid">

          <div className="investigation-meta-card">

            <Fingerprint size={17} />

            <div>

              <span>
                TRANSACTION TYPE
              </span>

              <strong>
                {
                  formatType(
                    transaction
                      .transaction_type
                  )
                }
              </strong>

            </div>

          </div>


          <div className="investigation-meta-card">

            <UserRound size={17} />

            <div>

              <span>
                CUSTOMER ID
              </span>

              <strong
                className="investigation-uuid"
              >
                {
                  transaction
                    .customer_id
                }
              </strong>

            </div>

          </div>


          <div className="investigation-meta-card">

            <CheckCircle2 size={17} />

            <div>

              <span>
                STATUS
              </span>

              <strong
                className={
                  `transaction-status-text ${transaction.status}`
                }
              >
                {
                  transaction.status
                }
              </strong>

            </div>

          </div>


          <div className="investigation-meta-card">

            <Clock3 size={17} />

            <div>

              <span>
                OCCURRED
              </span>

              <strong>
                {
                  formatDate(
                    transaction
                      .occurred_at
                  )
                }
              </strong>

            </div>

          </div>

        </div>

      </section>


      {
        !assessment
        ? (

          <section className="analysis-launchpad">

            <div className="analysis-radar">

              <div className="analysis-radar-ring ring-one" />
              <div className="analysis-radar-ring ring-two" />
              <div className="analysis-radar-ring ring-three" />

              <div className="analysis-radar-core">

                <ShieldCheck size={34} />

              </div>

            </div>


            <div className="analysis-launch-copy">

              <span className="panel-label">
                DETERMINISTIC ENGINE
              </span>

              <h2>
                This transaction has not
                been analyzed yet.
              </h2>

              <p>
                The compliance engine will evaluate
                this transaction against deterministic,
                explainable monitoring rules. No AI
                model is involved in calculating the
                risk score.
              </p>


              <button
                className="analysis-button"
                onClick={
                  runAnalysis
                }
                disabled={
                  analyzing
                }
              >

                {
                  analyzing
                  ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="spin-icon"
                      />

                      Running analysis...
                    </>
                  )
                  : (
                    <>
                      <Zap size={18} />

                      Analyze Transaction
                    </>
                  )
                }

              </button>

            </div>

          </section>

        )
        : (

          <>
            <section className="live-risk-grid">

              <div className="live-risk-stage">

                <div className="live-risk-stage-label">

                  <span className="panel-label">
                    DETERMINISTIC RISK SCORE
                  </span>

                  <span>
                    RULE VERSION
                    {" "}
                    {
                      assessment
                        .rule_version
                    }
                  </span>

                </div>


                <div
                  className={
                    `dynamic-risk-gauge ${riskClass(
                      assessment.risk_level
                    )}`
                  }
                  style={{
                    "--risk-degrees":
                      `${gaugeDegrees}deg`,
                  }}
                >

                  <div className="dynamic-risk-inner">

                    <span>
                      RISK SCORE
                    </span>

                    <strong>
                      {score}
                    </strong>

                    <div
                      className={
                        `dynamic-level-pill ${riskClass(
                          assessment.risk_level
                        )}`
                      }
                    >

                      {
                        assessment
                          .risk_level
                          .toUpperCase()
                      }

                    </div>

                  </div>

                </div>


                <div className="risk-scale">

                  <span>
                    0
                  </span>

                  <div>
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>
                    100
                  </span>

                </div>

              </div>


              <div className="live-rule-panel">

                <div className="live-rule-heading">

                  <div>

                    <span className="panel-label">
                      RULE EXPLAINABILITY
                    </span>

                    <h3>
                      {
                        assessment
                          .rule_matches
                          .length
                      }
                      {" "}
                      {
                        assessment
                          .rule_matches
                          .length === 1
                          ? "indicator"
                          : "indicators"
                      }
                      {" "}
                      matched
                    </h3>

                  </div>


                  <LockKeyhole size={18} />

                </div>


                {
                  assessment
                    .rule_matches
                    .length === 0
                  ? (

                    <div className="no-rule-match">

                      <CheckCircle2
                        size={24}
                      />

                      <strong>
                        No monitoring rules matched
                      </strong>

                      <span>
                        The deterministic engine
                        assigned no additional
                        risk points.
                      </span>

                    </div>

                  )
                  : (

                    <div className="live-rule-list">

                      {
                        assessment
                          .rule_matches
                          .map(
                            (
                              rule,
                              index
                            ) => {

                              const Icon =
                                ruleIcon(
                                  rule
                                    .rule_code
                                );

                              return (

                                <div
                                  className="live-rule-card"
                                  key={
                                    rule.id
                                    || rule.rule_code
                                  }
                                >

                                  <div className="live-rule-index">

                                    {
                                      String(
                                        index + 1
                                      )
                                      .padStart(
                                        2,
                                        "0"
                                      )
                                    }

                                  </div>


                                  <div className="live-rule-icon">

                                    <Icon
                                      size={18}
                                    />

                                  </div>


                                  <div className="live-rule-content">

                                    <strong>
                                      {
                                        rule
                                          .rule_name
                                      }
                                    </strong>

                                    <span>
                                      {
                                        rule
                                          .reason
                                      }
                                    </span>

                                    <small>
                                      {
                                        rule
                                          .rule_code
                                      }
                                    </small>

                                  </div>


                                  <div className="live-rule-points">

                                    +
                                    {
                                      rule
                                        .score_contribution
                                    }

                                  </div>

                                </div>

                              );
                            }
                          )
                      }

                    </div>

                  )
                }


                <div className="score-lock-banner">

                  <LockKeyhole size={16} />

                  <div>

                    <strong>
                      Deterministic score locked
                    </strong>

                    <span>
                      AI services may explain this
                      assessment later, but cannot
                      modify its score or level.
                    </span>

                  </div>

                </div>

              </div>

            </section>


            <section className="assessment-footer-grid">

              <div>

                <span>
                  ASSESSMENT ID
                </span>

                <strong>
                  {
                    assessment.id
                  }
                </strong>

              </div>


              <div>

                <span>
                  ANALYZED AT
                </span>

                <strong>
                  {
                    formatDate(
                      assessment
                        .analyzed_at
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  RULE ENGINE
                </span>

                <strong>
                  {
                    assessment
                      .rule_version
                  }
                </strong>

              </div>


              <div>

                <span>
                  DECISION SOURCE
                </span>

                <strong>
                  Deterministic
                </strong>

              </div>

            </section>

          </>
        )
      }

    </>
  );
}
