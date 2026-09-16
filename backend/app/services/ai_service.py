from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.ai_models import (
    AIExplanation,
)

from app.clients.event_client import (
    publish_event,
)

from app.clients.ollama_chat_client import (
    OllamaChatError,
    generate_json_response,
)

from app.knowledge.query_builder import (
    build_policy_query,
)

from app.repositories.ai_repository import (
    AIExplanationRepository,
)

from app.repositories.risk_repository import (
    RiskAssessmentRepository,
)

from app.repositories.transaction_repository import (
    TransactionRepository,
)

from app.services.knowledge_service import (
    KnowledgeService,
)

from app.settings import settings


SYSTEM_PROMPT = """
You are an AI assistant inside a synthetic
financial compliance training application.

Your job is ONLY to explain an already-computed
deterministic risk assessment.

Important rules:

1. Never change or recalculate the supplied
   risk score.

2. Never change the supplied risk level.

3. Only use the transaction information,
   matched deterministic rules, and supplied
   policy context.

4. Do not invent policies, regulations,
   customer history, evidence, or facts.

5. Do not claim that the transaction is illegal,
   fraudulent, or criminal.

6. Risk indicators only mean that additional
   review may be appropriate.

7. If policy context is insufficient, say that
   additional review or information may be needed.

8. Produce concise, professional language.

Return valid JSON with exactly these keys:

{
  "summary": "...",
  "rationale": "...",
  "recommended_action": "..."
}
""".strip()


class AIService:

    @staticmethod
    def generate_explanation(
        db: Session,
        transaction_ref: str,
    ) -> dict:

        transaction = (
            TransactionRepository
            .get_by_ref_with_customer(
                db,
                transaction_ref,
            )
        )

        if not transaction:

            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )


        assessment = (
            RiskAssessmentRepository
            .get_by_transaction_id(
                db,
                transaction.id,
            )
        )

        if not assessment:

            raise HTTPException(
                status_code=409,
                detail=(
                    "Transaction must be analyzed "
                    "before generating an AI explanation."
                ),
            )


        existing = (
            AIExplanationRepository
            .get_by_assessment_id(
                db,
                assessment.id,
            )
        )

        if existing:

            return AIService._build_response(
                transaction_ref=
                    transaction.transaction_ref,

                assessment=
                    assessment,

                explanation=
                    existing,
            )


        semantic_query = (
            build_policy_query(
                transaction=
                    transaction,

                assessment=
                    assessment,
            )
        )


        policy_matches = (
            KnowledgeService.search(
                query=
                    semantic_query,

                limit=
                    4,
            )
        )


        policy_context_parts = []

        policy_sources = []


        for item in policy_matches:

            policy_context_parts.append(
                (
                    f'Policy ID: '
                    f'{item["policy_id"]}\n'

                    f'Title: '
                    f'{item["title"]}\n'

                    f'Category: '
                    f'{item["category"]}\n'

                    f'Text: '
                    f'{item["text"]}'
                )
            )

            policy_sources.append({
                "policy_id":
                    item["policy_id"],

                "title":
                    item["title"],

                "category":
                    item["category"],

                "chunk_id":
                    item["chunk_id"],

                "distance":
                    item["distance"],
            })


        policy_context = (
            "\n\n---\n\n"
            .join(
                policy_context_parts
            )
        )


        matched_rules_text = (
            "\n".join(
                (
                    f"- {match.rule_name}: "
                    f"{match.reason} "
                    f"(+{match.score_contribution} points)"
                )

                for match
                in assessment.rule_matches
            )
        )


        if not matched_rules_text:

            matched_rules_text = (
                "- No deterministic rules matched."
            )


        user_prompt = f"""
TRANSACTION

Reference:
{transaction.transaction_ref}

Amount:
{transaction.amount} {transaction.currency}

Type:
{transaction.transaction_type}

Origin:
{transaction.origin_country}

Destination:
{transaction.destination_country}


DETERMINISTIC ASSESSMENT

Risk score:
{assessment.risk_score}

Risk level:
{assessment.risk_level}

Rule version:
{assessment.rule_version}

Matched rules:
{matched_rules_text}


RETRIEVED POLICY CONTEXT

{policy_context}


Generate an explanation of this existing
assessment.

Do not alter the score or risk level.
""".strip()


        try:

            result = (
                generate_json_response(
                    system_prompt=
                        SYSTEM_PROMPT,

                    user_prompt=
                        user_prompt,
                )
            )

        except OllamaChatError as exc:

            raise HTTPException(
                status_code=503,
                detail=str(exc),
            ) from exc


        summary = (
            str(
                result.get(
                    "summary",
                    ""
                )
            )
            .strip()
        )

        rationale = (
            str(
                result.get(
                    "rationale",
                    ""
                )
            )
            .strip()
        )

        recommended_action = (
            str(
                result.get(
                    "recommended_action",
                    ""
                )
            )
            .strip()
        )


        if not all([
            summary,
            rationale,
            recommended_action,
        ]):

            raise HTTPException(
                status_code=502,
                detail=(
                    "AI response was missing "
                    "required fields."
                ),
            )


        explanation = AIExplanation(
            assessment_id=
                assessment.id,

            model_name=
                settings.ollama_model,

            prompt_version=
                "v1",

            summary=
                summary,

            rationale=
                rationale,

            recommended_action=
                recommended_action,

            policy_sources=
                policy_sources,
        )


        try:

            explanation = (
                AIExplanationRepository
                .create(
                    db,
                    explanation,
                )
            )

        except IntegrityError:

            db.rollback()

            explanation = (
                AIExplanationRepository
                .get_by_assessment_id(
                    db,
                    assessment.id,
                )
            )

            if not explanation:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "AI explanation could "
                        "not be stored."
                    ),
                )


        publish_event(
            event_type=
                "AI_EXPLANATION_CREATED",

            transaction_ref=
                transaction.transaction_ref,

            payload={
                "risk_score":
                    assessment.risk_score,

                "risk_level":
                    assessment.risk_level,

                "model":
                    settings.ollama_model,

                "prompt_version":
                    "v1",

                "policy_ids": [
                    source["policy_id"]
                    for source
                    in policy_sources
                ],
            },
        )


        return AIService._build_response(
            transaction_ref=
                transaction.transaction_ref,

            assessment=
                assessment,

            explanation=
                explanation,
        )


    @staticmethod
    def get_explanation(
        db: Session,
        transaction_ref: str,
    ) -> dict:

        transaction = (
            TransactionRepository
            .get_by_ref(
                db,
                transaction_ref,
            )
        )

        if not transaction:

            raise HTTPException(
                status_code=404,
                detail="Transaction not found.",
            )


        assessment = (
            RiskAssessmentRepository
            .get_by_transaction_id(
                db,
                transaction.id,
            )
        )

        if not assessment:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Risk assessment not found."
                ),
            )


        explanation = (
            AIExplanationRepository
            .get_by_assessment_id(
                db,
                assessment.id,
            )
        )

        if not explanation:

            raise HTTPException(
                status_code=404,
                detail=(
                    "AI explanation not found."
                ),
            )


        return AIService._build_response(
            transaction_ref=
                transaction.transaction_ref,

            assessment=
                assessment,

            explanation=
                explanation,
        )


    @staticmethod
    def _build_response(
        *,
        transaction_ref: str,
        assessment,
        explanation,
    ) -> dict:

        return {
            "id":
                explanation.id,

            "transaction_ref":
                transaction_ref,

            "assessment_id":
                assessment.id,

            "risk_score":
                assessment.risk_score,

            "risk_level":
                assessment.risk_level,

            "model_name":
                explanation.model_name,

            "prompt_version":
                explanation.prompt_version,

            "summary":
                explanation.summary,

            "rationale":
                explanation.rationale,

            "recommended_action":
                explanation.recommended_action,

            "policy_sources":
                explanation.policy_sources,

            "generated_at":
                explanation.generated_at,
        }
