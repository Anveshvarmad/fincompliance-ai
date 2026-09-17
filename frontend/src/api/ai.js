import {
  apiRequest,
} from "./client";


export function generateAIExplanation(
  transactionRef
) {

  return apiRequest(
    `/api/v1/ai/transactions/${transactionRef}/explain`,
    {
      method: "POST",
    }
  );
}


export function getAIExplanation(
  transactionRef
) {

  return apiRequest(
    `/api/v1/ai/transactions/${transactionRef}/explanation`
  );
}
