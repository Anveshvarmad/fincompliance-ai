import {
  AlertTriangle,
  ArrowRight,
  Brain,
  BrainCircuit,
  Check,
  CheckCircle2,
  Database,
  FileSearch,
  Fingerprint,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
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
  getTransactions,
  getTransaction,
} from "../api/transactions";

import {
  analyzeTransaction,
  getAssessment,
} from "../api/compliance";

import {
  generateAIExplanation,
  getAIExplanation,
} from "../api/ai";


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


function riskClass(
  value
) {

  return (
    value?.toLowerCase()
    || "unassessed"
  );
}


function relevanceFromDistance(
  distance
) {

  const numeric =
    Number(distance);

  if (
    Number.isNaN(numeric)
  ) {
    return 0;
  }

  return Math.round(
    (
      1 /
      (
        1 +
        Math.max(
          numeric,
          0
        )
      )
    )
    * 100
  );
}


export default function AIPage() {

  const [
    transactions,
    setTransactions,
  ] = useState([]);


  const [
    transactionRef,
    setTransactionRef,
  ] = useState("");


  const [
    transaction,
    setTransaction,
  ] = useState(null);


  const [
    assessment,
    setAssessment,
  ] = useState(null);


  const [
    explanation,
    setExplanation,
  ] = useState(null);


  const [
    transactionSearch,
    setTransactionSearch,
  ] = useState("");


  const [
    loadingTransactions,
    setLoadingTransactions,
  ] = useState(true);


  const [
    loadingContext,
    setLoadingContext,
  ] = useState(false);


  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);


  const [
    generating,
    setGenerating,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  const loadTransactions =
    useCallback(
      async () => {

        setLoadingTransactions(
          true
        );

        try {

          const data =
            await getTransactions({
              limit: 50,
              offset: 0,
            });

          const items =
            data.items || [];

          setTransactions(
            items
          );


          if (
            !transactionRef
            && items.length > 0
          ) {

            setTransactionRef(
              items[0]
                .transaction_ref
            );
          }

        } catch (err) {

          setError(
            err.message
            || "Transactions could not be loaded."
          );

        } finally {

          setLoadingTransactions(
            false
          );
        }

      },
      [transactionRef]
    );


  const loadContext =
    useCallback(
      async ref => {

        if (!ref) {
          return;
        }

        setLoadingContext(
          true
        );

        setError(null);

        setTransaction(null);
        setAssessment(null);
        setExplanation(null);


        try {

          const tx =
            await getTransaction(
              ref
            );

          setTransaction(
            tx
          );


          try {

            const risk =
              await getAssessment(
                ref
              );

            setAssessment(
              risk
            );

          } catch (riskError) {

            if (
              riskError.status
              !== 404
            ) {
              throw riskError;
            }
          }


          try {

            const ai =
              await getAIExplanation(
                ref
              );

            setExplanation(
              ai
            );

          } catch (aiError) {

            if (
              aiError.status
              !== 404
            ) {
              throw aiError;
            }
          }

        } catch (err) {

          setError(
            err.message
            || "AI context could not be loaded."
          );

        } finally {

          setLoadingContext(
            false
          );
        }

      },
      []
    );


  useEffect(
    () => {

      loadTransactions();

    },
    [loadTransactions]
  );


  useEffect(
    () => {

      if (
        transactionRef
      ) {

        loadContext(
          transactionRef
        );
      }

    },
    [
      transactionRef,
      loadContext,
    ]
  );


  const visibleTransactions =
    useMemo(
      () => {

        const search =
          transactionSearch
            .trim()
            .toLowerCase();


        if (!search) {

          return transactions;
        }


        return transactions.filter(
          item => {

            return (
              item
                .transaction_ref
                .toLowerCase()
                .includes(search)
              ||
              item
                .transaction_type
                .toLowerCase()
                .includes(search)
              ||
              item
                .origin_country
                .toLowerCase()
                .includes(search)
              ||
              item
                .destination_country
                .toLowerCase()
                .includes(search)
            );
          }
        );

      },
      [
        transactions,
        transactionSearch,
      ]
    );


  async function runRiskAnalysis() {

    if (!transactionRef) {
      return;
    }

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
        || "Deterministic analysis failed."
      );

    } finally {

      setAnalyzing(false);
    }
  }


  async function generateExplanation() {

    if (!transactionRef) {
      return;
    }

    setGenerating(true);
    setError(null);


    try {

      const result =
        await generateAIExplanation(
          transactionRef
        );

      setExplanation(
        result
      );

    } catch (err) {

      setError(
        err.message
        || "AI explanation could not be generated."
      );

    } finally {

      setGenerating(false);
    }
  }


  const pipelineState = {
    transaction:
      Boolean(
        transaction
      ),

    rules:
      Boolean(
        assessment
      ),

    retrieval:
      Boolean(
        explanation
        ?.policy_sources
        ?.length
      ),

    generation:
      Boolean(
        explanation
      ),
  };


  return (
    <>

      <PageHeader
        eyebrow="GROUNDED INTELLIGENCE"
        title="AI compliance analysis"
        description="Generate human-readable explanations using fixed deterministic risk assessments and semantically retrieved policy context. AI explains the decision—it does not make or alter it."
      >

        <button
          className="secondary-button rag-refresh-button"
          onClick={
            () =>
              loadContext(
                transactionRef
              )
          }
          disabled={
            !transactionRef
            || loadingContext
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
            AI workspace error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      <section className="rag-pipeline">

        <div
          className={
            pipelineState
              .transaction
              ? "rag-stage complete"
              : "rag-stage"
          }
        >

          <div className="rag-stage-icon">
            <Fingerprint size={16} />
          </div>

          <div>

            <span>
              01
            </span>

            <strong>
              Transaction
            </strong>

          </div>

          {
            pipelineState
              .transaction
            && (
              <Check size={13} />
            )
          }

        </div>


        <ArrowRight
          className="rag-arrow"
          size={15}
        />


        <div
          className={
            pipelineState.rules
              ? "rag-stage complete"
              : "rag-stage"
          }
        >

          <div className="rag-stage-icon">
            <ShieldCheck size={16} />
          </div>

          <div>

            <span>
              02
            </span>

            <strong>
              Rules Engine
            </strong>

          </div>

          {
            pipelineState.rules
            && (
              <Check size={13} />
            )
          }

        </div>


        <ArrowRight
          className="rag-arrow"
          size={15}
        />


        <div
          className={
            pipelineState.retrieval
              ? "rag-stage complete"
              : "rag-stage"
          }
        >

          <div className="rag-stage-icon">
            <Database size={16} />
          </div>

          <div>

            <span>
              03
            </span>

            <strong>
              Chroma Retrieval
            </strong>

          </div>

          {
            pipelineState
              .retrieval
            && (
              <Check size={13} />
            )
          }

        </div>


        <ArrowRight
          className="rag-arrow"
          size={15}
        />


        <div
          className={
            pipelineState.generation
              ? "rag-stage complete"
              : "rag-stage"
          }
        >

          <div className="rag-stage-icon">
            <BrainCircuit size={16} />
          </div>

          <div>

            <span>
              04
            </span>

            <strong>
              Gemma 3
            </strong>

          </div>

          {
            pipelineState
              .generation
            && (
              <Check size={13} />
            )
          }

        </div>

      </section>


      <section className="rag-workspace">

        <aside className="rag-transaction-browser">

          <div className="rag-browser-heading">

            <div>

              <span className="panel-label">
                TRANSACTION SOURCE
              </span>

              <h3>
                Select activity
              </h3>

            </div>

            <span>
              {
                transactions.length
              }
            </span>

          </div>


          <div className="rag-transaction-search">

            <Search size={14} />

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
              placeholder="Search transactions..."
            />

          </div>


          <div className="rag-transaction-list">

            {
              loadingTransactions
              ? (

                <div className="rag-list-loading">

                  <LoaderCircle
                    size={18}
                    className="spin-icon"
                  />

                  Loading...

                </div>

              )
              : visibleTransactions
                  .map(
                    item => {

                      const active =
                        item.transaction_ref
                        === transactionRef;


                      return (

                        <button
                          className={
                            active
                              ? "rag-transaction-item active"
                              : "rag-transaction-item"
                          }
                          key={
                            item.transaction_ref
                          }
                          onClick={
                            () =>
                              setTransactionRef(
                                item.transaction_ref
                              )
                          }
                        >

                          <div>

                            <strong>
                              {
                                item
                                  .transaction_ref
                              }
                            </strong>

                            <span>
                              {
                                formatType(
                                  item
                                    .transaction_type
                                )
                              }
                            </span>

                          </div>


                          <div>

                            <strong>
                              {
                                formatMoney(
                                  item.amount,
                                  item.currency,
                                )
                              }
                            </strong>

                            <span>
                              {
                                item
                                  .origin_country
                              }
                              {" → "}
                              {
                                item
                                  .destination_country
                              }
                            </span>

                          </div>

                        </button>

                      );
                    }
                  )
            }

          </div>

        </aside>


        <div className="rag-analysis-workspace">

          {
            loadingContext
            ? (

              <div className="rag-context-loading">

                <div className="rag-ai-loader">

                  <BrainCircuit
                    size={29}
                  />

                  <span />
                  <span />
                  <span />

                </div>

                <strong>
                  Loading intelligence context
                </strong>

                <span>
                  Retrieving transaction,
                  deterministic assessment and
                  any existing AI explanation.
                </span>

              </div>

            )
            : !transaction
            ? (

              <div className="rag-context-loading">

                <AlertTriangle
                  size={28}
                />

                <strong>
                  Select a transaction
                </strong>

                <span>
                  Choose activity from the left
                  panel to begin.
                </span>

              </div>

            )
            : (

              <>
                <section className="rag-transaction-context">

                  <div className="rag-context-title">

                    <div>

                      <span className="panel-label">
                        LIVE CONTEXT
                      </span>

                      <h2>
                        {
                          transaction
                            .transaction_ref
                        }
                      </h2>

                    </div>


                    <div className="rag-live-pill">

                      <span />

                      API LIVE

                    </div>

                  </div>


                  <div className="rag-context-grid">

                    <div>

                      <span>
                        VALUE
                      </span>

                      <strong>
                        {
                          formatMoney(
                            transaction
                              .amount,
                            transaction
                              .currency,
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        TYPE
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


                    <div>

                      <span>
                        ROUTE
                      </span>

                      <strong>

                        {
                          transaction
                            .origin_country
                        }

                        {" → "}

                        {
                          transaction
                            .destination_country
                        }

                      </strong>

                    </div>


                    <div>

                      <span>
                        STATUS
                      </span>

                      <strong>
                        {
                          transaction
                            .status
                            .toUpperCase()
                        }
                      </strong>

                    </div>

                  </div>

                </section>


                {
                  !assessment
                  ? (

                    <section className="rag-gate-card">

                      <div className="rag-gate-symbol">

                        <LockKeyhole
                          size={28}
                        />

                      </div>


                      <div>

                        <span className="panel-label">
                          STEP 01 REQUIRED
                        </span>

                        <h2>
                          Establish deterministic risk first.
                        </h2>

                        <p>
                          AI generation is intentionally
                          blocked until the transaction has
                          passed through the rules engine.
                          This ensures the LLM cannot invent
                          or determine the compliance score.
                        </p>


                        <button
                          className="rag-primary-button"
                          onClick={
                            runRiskAnalysis
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
                                  size={17}
                                  className="spin-icon"
                                />

                                Running rules...
                              </>
                            )
                            : (
                              <>
                                <Zap size={17} />

                                Run Deterministic Analysis
                              </>
                            )
                          }

                        </button>

                      </div>

                    </section>

                  )
                  : (

                    <>
                      <section className="rag-assessment-strip">

                        <div className="rag-risk-score">

                          <span>
                            FIXED RISK SCORE
                          </span>

                          <strong>
                            {
                              assessment
                                .risk_score
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            LEVEL
                          </span>

                          <strong
                            className={
                              `rag-risk-level ${riskClass(
                                assessment
                                  .risk_level
                              )}`
                            }
                          >

                            {
                              assessment
                                .risk_level
                                .toUpperCase()
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            RULES MATCHED
                          </span>

                          <strong>
                            {
                              assessment
                                .rule_matches
                                .length
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            RULE VERSION
                          </span>

                          <strong>
                            {
                              assessment
                                .rule_version
                            }
                          </strong>

                        </div>


                        <div className="rag-lock-state">

                          <LockKeyhole
                            size={15}
                          />

                          <strong>
                            SCORE LOCKED
                          </strong>

                        </div>

                      </section>


                      <section className="rag-rule-context">

                        <div className="rag-section-heading">

                          <div>

                            <span className="panel-label">
                              DETERMINISTIC CONTEXT
                            </span>

                            <h3>
                              Matched monitoring rules
                            </h3>

                          </div>

                          <ShieldCheck
                            size={18}
                          />

                        </div>


                        {
                          assessment
                            .rule_matches
                            .length === 0
                          ? (

                            <div className="rag-no-rules">

                              <CheckCircle2
                                size={20}
                              />

                              No risk indicators matched.

                            </div>

                          )
                          : (

                            <div className="rag-rule-chips">

                              {
                                assessment
                                  .rule_matches
                                  .map(
                                    rule => (

                                      <div
                                        className="rag-rule-chip"
                                        key={
                                          rule.id
                                          || rule.rule_code
                                        }
                                      >

                                        <div>

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

                                        </div>


                                        <b>
                                          +
                                          {
                                            rule
                                              .score_contribution
                                          }
                                        </b>

                                      </div>

                                    )
                                  )
                              }

                            </div>

                          )
                        }

                      </section>


                      {
                        !explanation
                        ? (

                          <section className="rag-generation-launch">

                            <div className="rag-generation-art">

                              <div className="rag-generation-ring ring-a" />

                              <div className="rag-generation-ring ring-b" />

                              <div className="rag-generation-core">

                                <WandSparkles
                                  size={27}
                                />

                              </div>

                            </div>


                            <div>

                              <span className="panel-label">
                                RAG GENERATION
                              </span>

                              <h2>
                                Generate a grounded explanation.
                              </h2>

                              <p>
                                The backend will convert the
                                transaction and matched rules
                                into a semantic query, retrieve
                                relevant policy chunks from
                                ChromaDB, and provide those
                                sources to Gemma 3 as grounding
                                context.
                              </p>


                              <div className="rag-generation-tech">

                                <span>
                                  embeddinggemma
                                </span>

                                <ArrowRight
                                  size={12}
                                />

                                <span>
                                  ChromaDB
                                </span>

                                <ArrowRight
                                  size={12}
                                />

                                <span>
                                  gemma3:4b
                                </span>

                              </div>


                              <button
                                className="rag-primary-button"
                                onClick={
                                  generateExplanation
                                }
                                disabled={
                                  generating
                                }
                              >

                                {
                                  generating
                                  ? (
                                    <>
                                      <LoaderCircle
                                        size={17}
                                        className="spin-icon"
                                      />

                                      Retrieving + generating...
                                    </>
                                  )
                                  : (
                                    <>
                                      <Sparkles
                                        size={17}
                                      />

                                      Generate Grounded Explanation
                                    </>
                                  )
                                }

                              </button>

                            </div>

                          </section>

                        )
                        : (

                          <section className="rag-response">

                            <div className="rag-response-header">

                              <div className="rag-model-avatar">

                                <Brain
                                  size={21}
                                />

                              </div>


                              <div>

                                <span>
                                  GROUNDED EXPLANATION
                                </span>

                                <strong>
                                  Compliance Intelligence
                                </strong>

                                <small>
                                  {
                                    explanation
                                      .model_name
                                  }
                                  {" · "}
                                  {
                                    explanation
                                      .prompt_version
                                  }
                                </small>

                              </div>


                              <div className="rag-grounded-badge">

                                <CheckCircle2
                                  size={13}
                                />

                                GROUNDED

                              </div>

                            </div>


                            <div className="rag-response-section">

                              <span>
                                01 / SUMMARY
                              </span>

                              <p>
                                {
                                  explanation
                                    .summary
                                }
                              </p>

                            </div>


                            <div className="rag-response-section">

                              <span>
                                02 / RATIONALE
                              </span>

                              <p>
                                {
                                  explanation
                                    .rationale
                                }
                              </p>

                            </div>


                            <div className="rag-response-section rag-recommendation">

                              <span>
                                03 / RECOMMENDED ACTION
                              </span>

                              <p>
                                {
                                  explanation
                                    .recommended_action
                                }
                              </p>

                            </div>


                            <div className="rag-safety-banner">

                              <LockKeyhole
                                size={16}
                              />

                              <div>

                                <strong>
                                  AI did not calculate this risk score.
                                </strong>

                                <span>
                                  The displayed score of
                                  {" "}
                                  {
                                    assessment
                                      .risk_score
                                  }
                                  {" "}
                                  and
                                  {" "}
                                  {
                                    assessment
                                      .risk_level
                                      .toUpperCase()
                                  }
                                  {" "}
                                  classification came from
                                  deterministic rules before
                                  generation began.
                                </span>

                              </div>

                            </div>

                          </section>

                        )
                      }


                      {
                        explanation
                        && (
                          <section className="rag-sources">

                            <div className="rag-section-heading">

                              <div>

                                <span className="panel-label">
                                  RETRIEVAL TRACE
                                </span>

                                <h3>
                                  Grounding policy sources
                                </h3>

                              </div>


                              <div className="rag-source-count">

                                <FileSearch
                                  size={14}
                                />

                                {
                                  explanation
                                    .policy_sources
                                    .length
                                }
                                {" "}
                                chunks

                              </div>

                            </div>


                            <div className="rag-source-grid">

                              {
                                explanation
                                  .policy_sources
                                  .map(
                                    (
                                      source,
                                      index
                                    ) => {

                                      const relevance =
                                        relevanceFromDistance(
                                          source.distance
                                        );


                                      return (

                                        <article
                                          className="rag-source-card"
                                          key={
                                            source.chunk_id
                                          }
                                        >

                                          <div className="rag-source-rank">

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


                                          <span>
                                            {
                                              source
                                                .policy_id
                                            }
                                          </span>

                                          <h4>
                                            {
                                              source
                                                .title
                                            }
                                          </h4>

                                          <small>
                                            {
                                              source
                                                .category
                                            }
                                          </small>


                                          <div className="rag-source-distance">

                                            <div>

                                              <i
                                                style={{
                                                  width:
                                                    `${relevance}%`,
                                                }}
                                              />

                                            </div>

                                            <span>
                                              Relative relevance
                                              {" "}
                                              {relevance}%
                                            </span>

                                          </div>


                                          <footer>

                                            <span>
                                              VECTOR DISTANCE
                                            </span>

                                            <strong>
                                              {
                                                Number(
                                                  source.distance
                                                )
                                                .toFixed(4)
                                              }
                                            </strong>

                                          </footer>

                                        </article>

                                      );
                                    }
                                  )
                              }

                            </div>


                            <div className="rag-distance-note">

                              <Globe2
                                size={15}
                              />

                              Relative relevance is a UI
                              transformation of embedding
                              distance. It is not a regulatory
                              confidence score.

                            </div>

                          </section>
                        )
                      }

                    </>
                  )
                }

              </>
            )
          }

        </div>

      </section>

    </>
  );
}
