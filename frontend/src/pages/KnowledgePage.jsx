import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileSearch,
  Filter,
  Layers3,
  LoaderCircle,
  Search,
  Sparkles,
  Target,
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
  searchPolicies,
} from "../api/knowledge";


const INITIAL_QUERY =
  "large international wire transfer";


const sampleQueries = [
  "large international wire transfer",
  "many payments made quickly",
  "large cash withdrawal",
  "transaction from an unusual country",
  "manual review for multiple risk indicators",
];


function titleCase(
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

  const value =
    1 / (
      1
      + Math.max(
        0,
        numeric
      )
    );

  return Math.round(
    value * 100
  );
}


function distanceLabel(
  distance
) {

  const numeric =
    Number(distance);

  if (
    Number.isNaN(numeric)
  ) {
    return "—";
  }

  return numeric.toFixed(4);
}


export default function KnowledgePage() {

  const [
    query,
    setQuery,
  ] = useState(
    INITIAL_QUERY
  );


  const [
    activeQuery,
    setActiveQuery,
  ] = useState(
    INITIAL_QUERY
  );


  const [
    category,
    setCategory,
  ] = useState("");


  const [
    results,
    setResults,
  ] = useState([]);


  const [
    selected,
    setSelected,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(null);


  const categories =
    useMemo(
      () => {

        const values =
          results
            .map(
              item =>
                item.category
            )
            .filter(Boolean);

        return [
          ...new Set(
            values
          ),
        ];

      },
      [results]
    );


  const runSearch =
    useCallback(
      async (
        searchQuery,
        searchCategory = category
      ) => {

        const cleanQuery =
          searchQuery.trim();


        if (
          cleanQuery.length < 3
        ) {

          setError(
            "Search query must contain at least 3 characters."
          );

          return;
        }


        setLoading(true);
        setError(null);


        try {

          const data =
            await searchPolicies({
              query:
                cleanQuery,

              limit:
                8,

              category:
                searchCategory,
            });


          const items =
            data.items || [];


          setResults(
            items
          );

          setActiveQuery(
            cleanQuery
          );


          setSelected(
            current => {

              if (
                current
                &&
                items.some(
                  item =>
                    item.chunk_id
                    === current.chunk_id
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

          setResults([]);
          setSelected(null);

          setError(
            err.message
            || "Semantic search failed."
          );

        } finally {

          setLoading(false);
        }

      },
      [category]
    );


  useEffect(
    () => {

      runSearch(
        INITIAL_QUERY,
        ""
      );

    },
    []
  );


  function submitSearch(
    event
  ) {

    event.preventDefault();

    runSearch(
      query,
      category
    );
  }


  function useSampleQuery(
    value
  ) {

    setQuery(
      value
    );

    setCategory("");

    runSearch(
      value,
      ""
    );
  }


  async function changeCategory(
    value
  ) {

    setCategory(
      value
    );

    await runSearch(
      activeQuery,
      value
    );
  }


  function clearCategory() {

    setCategory("");

    runSearch(
      activeQuery,
      ""
    );
  }


  return (
    <>

      <PageHeader
        eyebrow="VECTOR KNOWLEDGE"
        title="Policy intelligence"
        description="Search compliance knowledge by meaning instead of exact keywords. Queries are embedded locally and matched against policy vectors stored in ChromaDB."
      />


      <section className="live-knowledge-hero">

        <div className="knowledge-neural-field">

          <div className="knowledge-orbit knowledge-orbit-one" />

          <div className="knowledge-orbit knowledge-orbit-two" />

          <div className="knowledge-orbit knowledge-orbit-three" />

          <div className="knowledge-core">

            <BrainCircuit
              size={29}
            />

          </div>

        </div>


        <div className="knowledge-search-content">

          <div className="knowledge-engine-label">

            <span>
              <Sparkles size={13} />
              SEMANTIC RETRIEVAL
            </span>

            <span>
              EMBEDDINGGEMMA
            </span>

            <span>
              CHROMADB
            </span>

          </div>


          <h2>
            Search by meaning.
          </h2>

          <p>
            Try natural language. The query does not
            need to contain the same words as the
            policy document.
          </p>


          <form
            className="live-semantic-search"
            onSubmit={
              submitSearch
            }
          >

            <Search size={18} />

            <input
              value={query}
              onChange={
                event =>
                  setQuery(
                    event.target.value
                  )
              }
              placeholder="Describe the transaction or compliance concern..."
            />

            {
              query
              && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={
                    () =>
                      setQuery("")
                  }
                >

                  <X size={14} />

                </button>
              )
            }


            <button
              className="semantic-submit"
              type="submit"
              disabled={
                loading
              }
            >

              {
                loading
                ? (
                  <LoaderCircle
                    className="spin-icon"
                    size={16}
                  />
                )
                : (
                  <Sparkles
                    size={16}
                  />
                )
              }

              Search

            </button>

          </form>


          <div className="knowledge-suggestions">

            <span>
              TRY
            </span>

            {
              sampleQueries.map(
                item => (

                  <button
                    key={item}
                    onClick={
                      () =>
                        useSampleQuery(
                          item
                        )
                    }
                  >

                    {item}

                  </button>

                )
              )
            }

          </div>

        </div>

      </section>


      {error && (

        <div className="api-error">

          <strong>
            Semantic search unavailable
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      <section className="knowledge-stats-strip">

        <div>

          <Target size={16} />

          <span>
            RESULTS
          </span>

          <strong>
            {
              results.length
            }
          </strong>

        </div>


        <div>

          <Layers3 size={16} />

          <span>
            SEARCH MODE
          </span>

          <strong>
            Vector similarity
          </strong>

        </div>


        <div>

          <Database size={16} />

          <span>
            VECTOR STORE
          </span>

          <strong>
            ChromaDB
          </strong>

        </div>


        <div>

          <BrainCircuit size={16} />

          <span>
            EMBEDDINGS
          </span>

          <strong>
            embeddinggemma
          </strong>

        </div>

      </section>


      <section className="knowledge-toolbar">

        <div>

          <FileSearch size={15} />

          <span>
            Searching for
          </span>

          <strong>
            “{activeQuery}”
          </strong>

        </div>


        <div className="knowledge-filter-shell">

          <Filter size={14} />

          <select
            value={category}
            onChange={
              event =>
                changeCategory(
                  event.target.value
                )
            }
          >

            <option value="">
              All categories
            </option>

            {
              categories.map(
                item => (

                  <option
                    value={item}
                    key={item}
                  >

                    {
                      titleCase(
                        item
                      )
                    }

                  </option>

                )
              )
            }

          </select>


          {
            category
            && (
              <button
                onClick={
                  clearCategory
                }
              >
                Clear
              </button>
            )
          }

        </div>

      </section>


      {
        loading
        ? (

          <section className="knowledge-loading">

            <div className="vector-loader">

              <div />
              <div />
              <div />

            </div>

            <strong>
              Searching vector space
            </strong>

            <span>
              Creating query embedding and
              comparing it with policy vectors...
            </span>

          </section>

        )
        : results.length === 0
        ? (

          <section className="knowledge-empty">

            <FileSearch size={29} />

            <strong>
              No matching policy chunks
            </strong>

            <span>
              Try a broader semantic query or
              remove the category filter.
            </span>

          </section>

        )
        : (

          <section className="knowledge-explorer">

            <div className="knowledge-results-list">

              <div className="knowledge-results-heading">

                <div>

                  <span className="panel-label">
                    VECTOR MATCHES
                  </span>

                  <h3>
                    Retrieved policy chunks
                  </h3>

                </div>

                <span>
                  {
                    results.length
                  }
                  {" "}
                  results
                </span>

              </div>


              {
                results.map(
                  item => {

                    const relevance =
                      relevanceFromDistance(
                        item.distance
                      );


                    const isSelected =
                      selected?.chunk_id
                      === item.chunk_id;


                    return (

                      <button
                        className={
                          isSelected
                            ? "knowledge-result-card selected"
                            : "knowledge-result-card"
                        }
                        key={
                          item.chunk_id
                        }
                        onClick={
                          () =>
                            setSelected(
                              item
                            )
                        }
                      >

                        <div className="result-rank">

                          {
                            String(
                              item.rank
                            )
                            .padStart(
                              2,
                              "0"
                            )
                          }

                        </div>


                        <div className="result-body">

                          <div className="result-meta">

                            <span>
                              {
                                item.policy_id
                              }
                            </span>

                            <span>
                              {
                                titleCase(
                                  item.category
                                )
                              }
                            </span>

                          </div>


                          <strong>
                            {
                              item.title
                            }
                          </strong>


                          <p>

                            {
                              item.text
                                .replace(
                                  /^Title:.*\n?/,
                                  ""
                                )
                                .replace(
                                  /^Category:.*\n?/m,
                                  ""
                                )
                                .slice(
                                  0,
                                  175
                                )
                            }

                            ...

                          </p>


                          <div className="result-relevance">

                            <div>

                              <span
                                style={{
                                  width:
                                    `${relevance}%`,
                                }}
                              />

                            </div>

                            <small>
                              Relative relevance
                              {" "}
                              {relevance}%
                            </small>

                          </div>

                        </div>


                        <ArrowRight
                          size={15}
                        />

                      </button>

                    );
                  }
                )
              }

            </div>


            <aside className="policy-inspector">

              {
                selected
                && (
                  <>

                    <div className="policy-inspector-header">

                      <div className="policy-inspector-icon">

                        <FileSearch
                          size={20}
                        />

                      </div>


                      <div>

                        <span>
                          POLICY CONTEXT
                        </span>

                        <strong>
                          {
                            selected
                              .policy_id
                          }
                        </strong>

                      </div>

                    </div>


                    <div className="policy-inspector-category">

                      {
                        titleCase(
                          selected.category
                        )
                      }

                    </div>


                    <h2>
                      {
                        selected.title
                      }
                    </h2>


                    <div className="policy-inspector-document">

                      <span>
                        RETRIEVED CHUNK
                      </span>

                      <p>
                        {
                          selected.text
                        }
                      </p>

                    </div>


                    <div className="vector-details">

                      <div>

                        <span>
                          CHUNK ID
                        </span>

                        <strong>
                          {
                            selected
                              .chunk_id
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          CHUNK INDEX
                        </span>

                        <strong>
                          {
                            selected
                              .chunk_index
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          VECTOR DISTANCE
                        </span>

                        <strong>
                          {
                            distanceLabel(
                              selected.distance
                            )
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          RELATIVE RELEVANCE
                        </span>

                        <strong>
                          {
                            relevanceFromDistance(
                              selected.distance
                            )
                          }
                          %
                        </strong>

                      </div>

                    </div>


                    <div className="vector-explanation">

                      <BrainCircuit
                        size={17}
                      />

                      <div>

                        <strong>
                          Why was this retrieved?
                        </strong>

                        <span>
                          Your query and this policy
                          chunk are close in embedding
                          space. The displayed relevance
                          is a UI transformation of vector
                          distance, not a compliance
                          confidence score.
                        </span>

                      </div>

                    </div>

                  </>
                )
              }

            </aside>

          </section>

        )
      }

    </>
  );
}
