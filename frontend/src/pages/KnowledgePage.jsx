import {
  BrainCircuit,
  Search,
  Sparkles,
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";

import {
  policies,
} from "../data/mockData";


export default function KnowledgePage() {

  return (
    <>

      <PageHeader
        eyebrow="VECTOR KNOWLEDGE"
        title="Policy intelligence"
        description="Search compliance knowledge by meaning,
        not just exact keywords."
      />


      <section className="semantic-search-hero">

        <div className="semantic-glow" />

        <BrainCircuit
          className="semantic-icon"
          size={34}
        />

        <h2>
          What are you investigating?
        </h2>

        <p>
          Semantic retrieval powered by vector
          embeddings and policy context.
        </p>


        <div className="semantic-search-box">

          <Search size={19} />

          <input
            defaultValue="large overseas wire transfer"
          />

          <button>
            Search
            <Sparkles size={16} />
          </button>

        </div>

      </section>


      <section className="policy-results">

        <div className="panel-heading">

          <div>

            <span className="panel-label">
              SEMANTIC RESULTS
            </span>

            <h3>
              Related policies
            </h3>

          </div>

          <span className="muted">
            3 matches
          </span>

        </div>


        <div className="policy-grid">

          {policies.map(
            (policy, index) => (

              <article
                className="policy-card"
                key={policy.id}
              >

                <div className="policy-rank">
                  0{index + 1}
                </div>

                <span className="policy-category">
                  {policy.category}
                </span>

                <h3>
                  {policy.title}
                </h3>

                <p>
                  {policy.description}
                </p>


                <div className="policy-footer">

                  <span>
                    {policy.id}
                  </span>

                  <strong>
                    {policy.match} match
                  </strong>

                </div>

              </article>

            )
          )}

        </div>

      </section>

    </>
  );
}
