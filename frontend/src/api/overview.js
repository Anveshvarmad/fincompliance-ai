import {
  apiRequest,
} from "./client";

import {
  getAuditEvents,
  getAuditHealth,
} from "./audit";


export function getDashboardOverview() {

  return apiRequest(
    "/api/v1/dashboard/overview"
  );
}


export function getBackendHealth() {

  return apiRequest(
    "/health"
  );
}


export async function getCommandCenterData() {

  const [
    dashboardResult,
    backendHealthResult,
    auditHealthResult,
    auditEventsResult,
  ] =
    await Promise.allSettled([
      getDashboardOverview(),
      getBackendHealth(),
      getAuditHealth(),
      getAuditEvents({
        limit: 100,
      }),
    ]);


  return {
    dashboard:
      dashboardResult.status
      === "fulfilled"
        ? dashboardResult.value
        : null,

    backendHealth:
      backendHealthResult.status
      === "fulfilled"
        ? backendHealthResult.value
        : null,

    auditHealth:
      auditHealthResult.status
      === "fulfilled"
        ? auditHealthResult.value
        : null,

    auditEvents:
      auditEventsResult.status
      === "fulfilled"
        ? auditEventsResult.value
        : null,

    errors: [
      dashboardResult,
      backendHealthResult,
      auditHealthResult,
      auditEventsResult,
    ]
      .filter(
        item =>
          item.status
          === "rejected"
      )
      .map(
        item =>
          item.reason?.message
          || "Unknown service error"
      ),
  };
}
