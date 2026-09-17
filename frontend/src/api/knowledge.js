import {
  apiRequest,
} from "./client";


export function searchPolicies({
  query,
  limit = 6,
  category = "",
}) {

  const params =
    new URLSearchParams();

  params.set(
    "q",
    query
  );

  params.set(
    "limit",
    String(limit)
  );


  if (category) {

    params.set(
      "category",
      category
    );
  }


  return apiRequest(
    `/api/v1/knowledge/search?${params.toString()}`
  );
}
