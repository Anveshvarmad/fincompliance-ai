import {
  apiRequest,
} from "./client";


export function getTransactions({
  limit = 25,
  offset = 0,
  customerRef = "",
  status = "",
  transactionType = "",
  originCountry = "",
  destinationCountry = "",
  minAmount = "",
  maxAmount = "",
} = {}) {

  const params =
    new URLSearchParams();


  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(offset)
  );


  if (customerRef) {
    params.set(
      "customer_ref",
      customerRef
    );
  }


  if (status) {
    params.set(
      "status",
      status
    );
  }


  if (transactionType) {
    params.set(
      "transaction_type",
      transactionType
    );
  }


  if (originCountry) {
    params.set(
      "origin_country",
      originCountry
    );
  }


  if (destinationCountry) {
    params.set(
      "destination_country",
      destinationCountry
    );
  }


  if (minAmount) {
    params.set(
      "min_amount",
      minAmount
    );
  }


  if (maxAmount) {
    params.set(
      "max_amount",
      maxAmount
    );
  }


  return apiRequest(
    `/api/v1/transactions?${params}`
  );
}


export function getTransaction(
  transactionRef
) {

  return apiRequest(
    `/api/v1/transactions/${transactionRef}`
  );
}
