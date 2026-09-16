import {
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";

import {
  transactions,
} from "../data/mockData";


export default function TransactionsPage() {

  return (
    <>

      <PageHeader
        eyebrow="TRANSACTION INTELLIGENCE"
        title="Transaction explorer"
        description="Search, filter and inspect financial
        activity across monitored workflows."
      />


      <div className="terminal-toolbar">

        <div className="terminal-search">

          <Search size={16} />

          <input
            placeholder="Search transaction ID, customer..."
          />

        </div>


        <button className="secondary-button">

          <Filter size={16} />

          Filters

        </button>


        <button className="secondary-button">

          <SlidersHorizontal size={16} />

          Columns

        </button>

      </div>


      <section className="transaction-terminal">

        <div className="terminal-header">

          <span>
            Transaction
          </span>

          <span>
            Customer
          </span>

          <span>
            Amount
          </span>

          <span>
            Type
          </span>

          <span>
            Route
          </span>

          <span>
            Score
          </span>

          <span>
            Risk
          </span>

          <span>
            Time
          </span>

        </div>


        {transactions.map(
          (transaction) => (

            <div
              className="terminal-row"
              key={transaction.id}
            >

              <strong>
                {transaction.id}
              </strong>

              <span>
                {transaction.customer}
              </span>

              <strong>
                {transaction.amount}
              </strong>

              <span>
                {transaction.type}
              </span>

              <span className="route-pill">
                {transaction.route}
              </span>

              <span className="score-cell">
                {transaction.score}
              </span>

              <span
                className={
                  `risk-badge ${transaction.risk.toLowerCase()}`
                }
              >
                {transaction.risk}
              </span>

              <span className="muted">
                {transaction.time}
              </span>

            </div>

          )
        )}

      </section>

    </>
  );
}
