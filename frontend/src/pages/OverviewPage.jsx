import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Gauge,
  LoaderCircle,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MetricCard
  from "../components/MetricCard";

import PageHeader
  from "../components/PageHeader";

import {
  getCommandCenterData,
} from "../api/overview";


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
        maximumFractionDigits: 0,
      }
    ).format(value);

  } catch {

    return `${value.toFixed(0)} ${currency}`;
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
  value = ""
) {

  return (
    value
      .toLowerCase()
    || "unassessed"
  );
}


export default function OverviewPage() {

  const navigate =
    useNavigate();


  const [
    data,
    setData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  const loadOverview =
    useCallback(
      async () => {

        setLoading(true);
        setError(null);


        try {

          const result =
            await getCommandCenterData();


          setData(
            result
          );


          if (
            !result.dashboard
          ) {

            setError(
              result.errors[0]
              || "Dashboard data could not be loaded."
            );
          }

        } catch (err) {

          setError(
            err.message
            || "Command center could not be loaded."
          );

        } finally {

          setLoading(false);
        }

      },
      []
    );


  useEffect(
    () => {

      loadOverview();

    },
    [loadOverview]
  );


  const metrics =
    data?.dashboard
      ?.metrics
    || {};


  const distribution =
    data?.dashboard
      ?.risk_distribution
    || {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };


  const riskActivity =
    data?.dashboard
      ?.risk_activity
    || [];


  const recentTransactions =
    data?.dashboard
      ?.recent_transactions
    || [];


  const auditEventCount =
    data?.auditEvents
      ?.total
    || 0;


  const totalRisk =
    useMemo(
      () => {

        return (
          distribution.low
          + distribution.medium
          + distribution.high
          + distribution.critical
        );

      },
      [distribution]
    );


  const services =
    useMemo(
      () => {

        const backendServices =
          data?.backendHealth
            ?.services
          || {};


        const values = [
          {
            name:
              "FastAPI",

            state:
              data?.backendHealth
                ? "up"
                : "down",

            icon:
              Server,
          },

          {
            name:
              "PostgreSQL",

            state:
              backendServices.postgres
              || "unknown",

            icon:
              Database,
          },

          {
            name:
              "MongoDB",

            state:
              backendServices.mongo
              || data?.auditHealth?.mongo
              || "unknown",

            icon:
              Database,
          },

          {
            name:
              "ChromaDB",

            state:
              backendServices.chroma
              || "unknown",

            icon:
              BrainCircuit,
          },

          {
            name:
              "Ollama",

            state:
              backendServices.ollama
              || "unknown",

            icon:
              BrainCircuit,
          },

          {
            name:
              "Event Service",

            state:
              data?.auditHealth?.status
              || backendServices.event_service
              || "unknown",

            icon:
              Radio,
          },
        ];


        return values;

      },
      [data]
    );


  const operationalServices =
    services.filter(
      service =>
        service.state
        === "up"
    ).length;


  if (
    loading
    &&
    !data
  ) {

    return (
      <div className="overview-live-loading">

        <LoaderCircle
          size={30}
          className="spin-icon"
        />

        <strong>
          Building command center
        </strong>

        <span>
          Aggregating PostgreSQL,
          compliance, AI and MongoDB
          telemetry...
        </span>

      </div>
    );
  }


  return (
    <>

      <PageHeader
        eyebrow="LIVE COMMAND CENTER"
        title="Financial intelligence,
        in one operational view."
        description="Real transaction, compliance,
        AI, event and infrastructure telemetry
        across the FinCompliance platform."
      >

        <button
          className="secondary-button overview-refresh-button"
          onClick={
            loadOverview
          }
          disabled={
            loading
          }
        >

          {
            loading
              ? (
                <LoaderCircle
                  className="spin-icon"
                  size={15}
                />
              )
              : (
                <RefreshCw
                  size={15}
                />
              )
          }

          Refresh

        </button>

      </PageHeader>


      {error && (

        <div className="api-error">

          <strong>
            Command center warning
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      <section className="metric-grid live-overview-metrics">

        <MetricCard
          label="TRANSACTIONS"
          value={
            (
              metrics
                .transactions_total
              || 0
            )
            .toLocaleString()
          }
          detail={
            `${metrics.assessment_coverage || 0}% analyzed`
          }
          icon={
            CircleDollarSign
          }
        />


        <MetricCard
          label="HIGH + CRITICAL"
          value={
            (
              metrics
                .high_risk_total
              || 0
            )
            .toLocaleString()
          }
          detail="Deterministic risk classifications"
          icon={
            AlertTriangle
          }
          accent="danger"
        />


        <MetricCard
          label="AI EXPLANATIONS"
          value={
            (
              metrics
                .ai_explanations_total
              || 0
            )
            .toLocaleString()
          }
          detail={
            `${metrics.ai_coverage || 0}% of assessments explained`
          }
          icon={
            BrainCircuit
          }
          accent="violet"
        />


        <MetricCard
          label="SERVICE HEALTH"
          value={
            `${operationalServices}/${services.length}`
          }
          detail="Live infrastructure checks"
          icon={
            Activity
          }
          accent="success"
        />

      </section>


      <section className="command-center-secondary-metrics">

        <div>

          <Users size={16} />

          <span>
            CUSTOMERS
          </span>

          <strong>
            {
              (
                metrics
                  .customers_total
                || 0
              )
              .toLocaleString()
            }
          </strong>

        </div>


        <div>

          <ShieldCheck size={16} />

          <span>
            RISK ASSESSMENTS
          </span>

          <strong>
            {
              (
                metrics
                  .assessments_total
                || 0
              )
              .toLocaleString()
            }
          </strong>

        </div>


        <div>

          <Gauge size={16} />

          <span>
            AVG RISK SCORE
          </span>

          <strong>
            {
              metrics
                .average_risk_score
              || 0
            }
          </strong>

        </div>


        <div>

          <Radio size={16} />

          <span>
            AUDIT EVENTS
          </span>

          <strong>
            {
              auditEventCount
                .toLocaleString()
            }
          </strong>

        </div>

      </section>


      <section className="live-overview-grid">

        <article className="glass-panel live-risk-chart">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                RISK TELEMETRY
              </span>

              <h3>
                Recent assessment scores
              </h3>

            </div>


            <span className="live-indicator">
              LIVE
            </span>

          </div>


          {
            riskActivity.length
            > 0
            ? (

              <div className="chart-shell">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={
                      riskActivity
                    }
                  >

                    <defs>

                      <linearGradient
                        id="liveRiskGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="5%"
                          stopColor="#8b73ff"
                          stopOpacity={0.45}
                        />

                        <stop
                          offset="95%"
                          stopColor="#8b73ff"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>


                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,.05)"
                      vertical={false}
                    />


                    <XAxis
                      dataKey="time"
                      stroke="#596275"
                      tickLine={false}
                      axisLine={false}
                      fontSize={9}
                    />


                    <YAxis
                      domain={[
                        0,
                        100,
                      ]}
                      stroke="#596275"
                      tickLine={false}
                      axisLine={false}
                      fontSize={9}
                    />


                    <Tooltip
                      contentStyle={{
                        background:
                          "#0d1018",

                        border:
                          "1px solid rgba(255,255,255,.08)",

                        borderRadius:
                          10,

                        fontSize:
                          10,
                      }}
                    />


                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#8b73ff"
                      strokeWidth={2}
                      fill="url(#liveRiskGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            )
            : (

              <div className="overview-empty-chart">

                <ShieldCheck
                  size={26}
                />

                <strong>
                  No assessments yet
                </strong>

                <span>
                  Analyze transactions to
                  populate live risk telemetry.
                </span>

              </div>

            )
          }

        </article>


        <article className="glass-panel live-distribution-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                RISK DISTRIBUTION
              </span>

              <h3>
                Assessment mix
              </h3>

            </div>

          </div>


          <div className="distribution-core">

            <div className="distribution-orbit">

              <div className="distribution-center">

                <strong>
                  {
                    totalRisk
                      .toLocaleString()
                  }
                </strong>

                <span>
                  ASSESSED
                </span>

              </div>

            </div>

          </div>


          <div className="distribution-list">

            {
              [
                [
                  "low",
                  distribution.low,
                ],
                [
                  "medium",
                  distribution.medium,
                ],
                [
                  "high",
                  distribution.high,
                ],
                [
                  "critical",
                  distribution.critical,
                ],
              ]
              .map(
                ([
                  level,
                  count,
                ]) => {

                  const percentage =
                    totalRisk
                    ? Math.round(
                        (
                          count
                          / totalRisk
                        )
                        * 100
                      )
                    : 0;


                  return (

                    <div
                      key={level}
                    >

                      <div>

                        <span
                          className={
                            `distribution-dot ${level}`
                          }
                        />

                        <strong>
                          {
                            level
                              .toUpperCase()
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          {percentage}%
                        </span>

                        <b>
                          {count}
                        </b>

                      </div>

                    </div>

                  );
                }
              )
            }

          </div>

        </article>

      </section>


      <section className="overview-bottom-grid">

        <article className="glass-panel live-recent-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                RECENT ACTIVITY
              </span>

              <h3>
                Latest transactions
              </h3>

            </div>


            <button
              className="text-button"
              onClick={
                () =>
                  navigate(
                    "/transactions"
                  )
              }
            >

              Open explorer

            </button>

          </div>


          <div className="live-overview-table">

            {
              recentTransactions
                .map(
                  transaction => (

                    <button
                      key={
                        transaction
                          .transaction_ref
                      }
                      className="live-overview-row"
                      onClick={
                        () =>
                          navigate(
                            `/transactions/${transaction.transaction_ref}`
                          )
                      }
                    >

                      <div>

                        <strong>
                          {
                            transaction
                              .transaction_ref
                          }
                        </strong>

                        <span>
                          {
                            formatType(
                              transaction
                                .transaction_type
                            )
                          }
                        </span>

                      </div>


                      <span>
                        {
                          transaction
                            .origin_country
                        }

                        {" → "}

                        {
                          transaction
                            .destination_country
                        }
                      </span>


                      <strong>
                        {
                          formatMoney(
                            transaction.amount,
                            transaction.currency,
                          )
                        }
                      </strong>


                      <span
                        className={
                          `risk-badge ${riskClass(
                            transaction.risk_level
                          )}`
                        }
                      >

                        {
                          transaction
                            .risk_level
                        }

                      </span>


                      <ArrowRight
                        size={14}
                      />

                    </button>

                  )
                )
            }

          </div>

        </article>


        <article className="glass-panel service-health-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                INFRASTRUCTURE
              </span>

              <h3>
                Service mesh
              </h3>

            </div>


            <CheckCircle2
              size={18}
            />

          </div>


          <div className="service-health-list">

            {
              services.map(
                ({
                  name,
                  state,
                  icon: Icon,
                }) => {

                  const online =
                    state
                    === "up";


                  return (

                    <div
                      key={name}
                    >

                      <div className="service-identity">

                        <div>
                          <Icon
                            size={15}
                          />
                        </div>

                        <strong>
                          {name}
                        </strong>

                      </div>


                      <span
                        className={
                          online
                            ? "service-state online"
                            : "service-state"
                        }
                      >

                        <i />

                        {
                          online
                            ? "Operational"
                            : state
                        }

                      </span>

                    </div>

                  );
                }
              )
            }

          </div>

        </article>

      </section>

    </>
  );
}
