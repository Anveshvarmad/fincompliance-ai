import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import PageHeader
  from "../components/PageHeader";

import {
  getTransactions,
} from "../api/transactions";


const PAGE_SIZE = 20;


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
  value
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


export default function TransactionsPage() {

  const [
    transactions,
    setTransactions,
  ] = useState([]);


  const [
    total,
    setTotal,
  ] = useState(0);


  const [
    offset,
    setOffset,
  ] = useState(0);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    transactionType,
    setTransactionType,
  ] = useState("");


  const [
    status,
    setStatus,
  ] = useState("");


  const [
    minAmount,
    setMinAmount,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  async function loadTransactions() {

    setLoading(true);
    setError(null);


    try {

      const data =
        await getTransactions({
          limit:
            PAGE_SIZE,

          offset,

          customerRef:
            search,

          transactionType,

          status,

          minAmount,
        });


      setTransactions(
        data.items
      );

      setTotal(
        data.total
      );

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(
    () => {

      loadTransactions();

    },
    [
      offset,
      transactionType,
      status,
      minAmount,
    ]
  );


  function submitSearch(
    event
  ) {

    event.preventDefault();

    setOffset(0);

    loadTransactions();
  }


  const currentPage =
    Math.floor(
      offset / PAGE_SIZE
    ) + 1;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / PAGE_SIZE
      )
    );


  return (
    <>

      <PageHeader
        eyebrow="TRANSACTION INTELLIGENCE"
        title="Transaction explorer"
        description="Live financial activity from the FinCompliance transaction API."
      />


      <form
        className="terminal-toolbar"
        onSubmit={submitSearch}
      >

        <div className="terminal-search">

          <Search size={16} />

          <input
            value={search}
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
            placeholder="Customer reference..."
          />

        </div>


        <select
          className="terminal-select"
          value={transactionType}
          onChange={
            event => {
              setOffset(0);

              setTransactionType(
                event.target.value
              );
            }
          }
        >

          <option value="">
            All transaction types
          </option>

          <option value="wire_transfer">
            Wire transfer
          </option>

          <option value="card_payment">
            Card payment
          </option>

          <option value="ach_transfer">
            ACH transfer
          </option>

          <option value="cash_withdrawal">
            Cash withdrawal
          </option>

          <option value="account_transfer">
            Account transfer
          </option>

        </select>


        <select
          className="terminal-select"
          value={status}
          onChange={
            event => {
              setOffset(0);

              setStatus(
                event.target.value
              );
            }
          }
        >

          <option value="">
            All statuses
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="failed">
            Failed
          </option>

        </select>


        <input
          className="amount-filter"
          type="number"
          min="0"
          value={minAmount}
          onChange={
            event => {
              setOffset(0);

              setMinAmount(
                event.target.value
              );
            }
          }
          placeholder="Min amount"
        />


        <button
          type="button"
          className="secondary-button refresh-button"
          onClick={
            loadTransactions
          }
        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </form>


      {error && (

        <div className="api-error">

          <strong>
            Could not load transactions
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


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
            Status
          </span>

          <span>
            Date
          </span>

        </div>


        {loading && (

          <div className="terminal-loading">

            <div className="loading-ring" />

            Loading live transactions...

          </div>

        )}


        {
          !loading &&
          transactions.length === 0 &&
          (

            <div className="terminal-loading">

              No transactions found.

            </div>

          )
        }


        {
          !loading &&
          transactions.map(
            transaction => (

              <div
                className="terminal-row live-transaction-row"
                key={transaction.id}
              >

                <strong>
                  {transaction.transaction_ref}
                </strong>

                <span className="mono-value">
                  {
                    transaction.customer_id
                      .slice(0, 8)
                  }...
                </span>

                <strong>
                  {
                    formatMoney(
                      transaction.amount,
                      transaction.currency,
                    )
                  }
                </strong>

                <span>
                  {
                    formatType(
                      transaction.transaction_type
                    )
                  }
                </span>

                <span className="route-pill">

                  {
                    transaction.origin_country
                  }

                  {" → "}

                  {
                    transaction.destination_country
                  }

                </span>

                <span
                  className={
                    `status-badge ${transaction.status}`
                  }
                >
                  {transaction.status}
                </span>

                <span className="muted">

                  {
                    new Date(
                      transaction.occurred_at
                    )
                    .toLocaleDateString()
                  }

                </span>

              </div>

            )
          )
        }

      </section>


      <div className="pagination-bar">

        <span>
          {total.toLocaleString()}
          {" "}
          transactions
        </span>


        <div>

          <button
            disabled={
              offset === 0
            }
            onClick={
              () =>
                setOffset(
                  Math.max(
                    0,
                    offset - PAGE_SIZE
                  )
                )
            }
          >

            <ChevronLeft size={15} />

          </button>


          <span>

            {currentPage}

            {" / "}

            {totalPages}

          </span>


          <button
            disabled={
              currentPage >=
              totalPages
            }
            onClick={
              () =>
                setOffset(
                  offset + PAGE_SIZE
                )
            }
          >

            <ChevronRight size={15} />

          </button>

        </div>

      </div>

    </>
  );
}
