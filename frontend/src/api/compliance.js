import {
  apiRequest,
} from "./client";


export function analyzeTransaction(
  transactionRef
) {

  return apiRequest(
    `/api/v1/compliance/transactions/${transactionRef}/analyze`,
    {
      method: "POST",
    }
  );
}


export function getAssessment(
  transactionRef
) {

  return apiRequest(
    `/api/v1/compliance/transactions/${transactionRef}/assessment`
  );
}
