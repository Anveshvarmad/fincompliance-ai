from sqlalchemy import text

from app.db import engine


DDL = [

    """
    CREATE TABLE IF NOT EXISTS outbox_events (
        id BIGSERIAL PRIMARY KEY,

        event_id VARCHAR(100)
            NOT NULL
            UNIQUE,

        event_type VARCHAR(100)
            NOT NULL,

        transaction_ref VARCHAR(100),

        source VARCHAR(100)
            NOT NULL
            DEFAULT 'postgres-outbox',

        payload JSONB
            NOT NULL
            DEFAULT '{}'::jsonb,

        occurred_at TIMESTAMPTZ
            NOT NULL
            DEFAULT NOW(),

        published_at TIMESTAMPTZ,

        attempts INTEGER
            NOT NULL
            DEFAULT 0,

        last_error TEXT,

        created_at TIMESTAMPTZ
            NOT NULL
            DEFAULT NOW()
    )
    """,


    """
    CREATE INDEX IF NOT EXISTS
        ix_outbox_events_pending
    ON outbox_events (id)
    WHERE published_at IS NULL
    """,


    """
    CREATE INDEX IF NOT EXISTS
        ix_outbox_events_transaction_ref
    ON outbox_events (transaction_ref)
    """,


    """
    CREATE OR REPLACE FUNCTION
    fn_outbox_transaction_created()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN

        INSERT INTO outbox_events (
            event_id,
            event_type,
            transaction_ref,
            source,
            payload,
            occurred_at
        )
        VALUES (
            'EVT-OUTBOX-'
            ||
            md5(
                random()::text
                ||
                clock_timestamp()::text
                ||
                NEW.id::text
            ),

            'TRANSACTION_CREATED',

            NEW.transaction_ref,

            'postgres-outbox',

            jsonb_build_object(
                'customer_id',
                    NEW.customer_id,

                'amount',
                    NEW.amount,

                'currency',
                    NEW.currency,

                'transaction_type',
                    NEW.transaction_type,

                'origin_country',
                    NEW.origin_country,

                'destination_country',
                    NEW.destination_country,

                'status',
                    NEW.status
            ),

            COALESCE(
                NEW.created_at,
                NOW()
            )
        );

        RETURN NEW;

    END;
    $$
    """,


    """
    DROP TRIGGER IF EXISTS
        trg_outbox_transaction_created
    ON transactions
    """,


    """
    CREATE TRIGGER
        trg_outbox_transaction_created

    AFTER INSERT
    ON transactions

    FOR EACH ROW

    EXECUTE FUNCTION
        fn_outbox_transaction_created()
    """,


    """
    CREATE OR REPLACE FUNCTION
    fn_outbox_risk_assessment_created()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE

        tx_ref VARCHAR(100);

    BEGIN

        SELECT transaction_ref
        INTO tx_ref
        FROM transactions
        WHERE id = NEW.transaction_id;


        INSERT INTO outbox_events (
            event_id,
            event_type,
            transaction_ref,
            source,
            payload,
            occurred_at
        )
        VALUES (
            'EVT-OUTBOX-'
            ||
            md5(
                random()::text
                ||
                clock_timestamp()::text
                ||
                NEW.id::text
            ),

            'RISK_ASSESSMENT_CREATED',

            tx_ref,

            'postgres-outbox',

            jsonb_build_object(
                'risk_score',
                    NEW.risk_score,

                'risk_level',
                    NEW.risk_level,

                'rule_version',
                    NEW.rule_version
            ),

            COALESCE(
                NEW.analyzed_at,
                NOW()
            )
        );


        RETURN NEW;

    END;
    $$
    """,


    """
    DROP TRIGGER IF EXISTS
        trg_outbox_risk_assessment_created
    ON risk_assessments
    """,


    """
    CREATE TRIGGER
        trg_outbox_risk_assessment_created

    AFTER INSERT
    ON risk_assessments

    FOR EACH ROW

    EXECUTE FUNCTION
        fn_outbox_risk_assessment_created()
    """,


    """
    CREATE OR REPLACE FUNCTION
    fn_outbox_ai_explanation_created()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE

        tx_ref VARCHAR(100);

    BEGIN

        SELECT t.transaction_ref
        INTO tx_ref
        FROM risk_assessments ra
        JOIN transactions t
            ON t.id = ra.transaction_id
        WHERE ra.id = NEW.assessment_id;


        INSERT INTO outbox_events (
            event_id,
            event_type,
            transaction_ref,
            source,
            payload,
            occurred_at
        )
        VALUES (
            'EVT-OUTBOX-'
            ||
            md5(
                random()::text
                ||
                clock_timestamp()::text
                ||
                NEW.id::text
            ),

            'AI_EXPLANATION_CREATED',

            tx_ref,

            'postgres-outbox',

            jsonb_build_object(
                'model',
                    NEW.model_name,

                'prompt_version',
                    NEW.prompt_version,

                'policy_sources',
                    NEW.policy_sources
            ),

            COALESCE(
                NEW.generated_at,
                NOW()
            )
        );


        RETURN NEW;

    END;
    $$
    """,


    """
    DROP TRIGGER IF EXISTS
        trg_outbox_ai_explanation_created
    ON ai_explanations
    """,


    """
    CREATE TRIGGER
        trg_outbox_ai_explanation_created

    AFTER INSERT
    ON ai_explanations

    FOR EACH ROW

    EXECUTE FUNCTION
        fn_outbox_ai_explanation_created()
    """,
]


def main():

    with engine.begin() as connection:

        for statement in DDL:

            connection.execute(
                text(statement)
            )


    print(
        "Transactional outbox initialized."
    )


if __name__ == "__main__":
    main()
