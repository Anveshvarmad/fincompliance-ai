import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { motion } from "framer-motion";

import MetricCard
  from "../components/MetricCard";

import PageHeader
  from "../components/PageHeader";

import {
  transactions,
} from "../data/mockData";


const chartData = [
  { time: "08:00", risk: 18 },
  { time: "09:00", risk: 27 },
  { time: "10:00", risk: 22 },
  { time: "11:00", risk: 46 },
  { time: "12:00", risk: 39 },
  { time: "13:00", risk: 71 },
  { time: "14:00", risk: 56 },
];


export default function OverviewPage() {

  return (
    <>

      <PageHeader
        eyebrow="COMMAND CENTER"
        title="Financial intelligence,
        without the noise."
        description="Monitor transaction activity,
        risk signals, AI analysis and compliance
        infrastructure from one operational view."
      >
        <button className="primary-button">
          Live Monitor
          <ArrowUpRight size={16} />
        </button>
      </PageHeader>


      <section className="metric-grid">

        <MetricCard
          label="TRANSACTIONS TODAY"
          value="18,492"
          detail="+8.4% from yesterday"
          icon={CircleDollarSign}
        />

        <MetricCard
          label="HIGH RISK"
          value="127"
          detail="0.68% of monitored activity"
          icon={AlertTriangle}
          accent="danger"
        />

        <MetricCard
          label="AI REVIEWS"
          value="4,821"
          detail="97.6% successfully grounded"
          icon={BrainCircuit}
          accent="violet"
        />

        <MetricCard
          label="SYSTEM HEALTH"
          value="99.98%"
          detail="6 services operational"
          icon={Activity}
          accent="success"
        />

      </section>


      <section className="overview-grid">

        <motion.div
          className="glass-panel risk-wave-panel"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
        >

          <div className="panel-heading">

            <div>
              <span className="panel-label">
                RISK PULSE
              </span>

              <h3>
                Risk activity
              </h3>
            </div>

            <span className="live-indicator">
              LIVE
            </span>

          </div>


          <div className="chart-shell">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
              >

                <defs>

                  <linearGradient
                    id="riskGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#7c5cff"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="95%"
                      stopColor="#7c5cff"
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
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#0d1018",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    borderRadius:
                      12,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#8b73ff"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>


        <motion.div
          className="glass-panel threat-orbit-panel"
          initial={{
            opacity: 0,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >

          <span className="panel-label">
            RISK ORBIT
          </span>

          <div className="risk-orbit">

            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="orbit-core">

              <strong>
                65
              </strong>

              <span>
                HIGH
              </span>

            </div>

          </div>

          <p>
            Current weighted risk index across
            monitored workflows.
          </p>

        </motion.div>

      </section>


      <section className="glass-panel">

        <div className="panel-heading">

          <div>

            <span className="panel-label">
              RECENT ACTIVITY
            </span>

            <h3>
              Transactions requiring attention
            </h3>

          </div>

          <button className="text-button">
            View all
          </button>

        </div>


        <div className="compact-table">

          {transactions
            .slice(0, 4)
            .map(
              (transaction) => (

                <div
                  className="compact-row"
                  key={transaction.id}
                >

                  <div>

                    <strong>
                      {transaction.id}
                    </strong>

                    <span>
                      {transaction.customer}
                    </span>

                  </div>

                  <span>
                    {transaction.type}
                  </span>

                  <span>
                    {transaction.route}
                  </span>

                  <strong>
                    {transaction.amount}
                  </strong>

                  <span
                    className={
                      `risk-badge ${transaction.risk.toLowerCase()}`
                    }
                  >
                    {transaction.risk}
                  </span>

                </div>

              )
            )}

        </div>

      </section>

    </>
  );
}
