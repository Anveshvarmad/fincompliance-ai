export const transactions = [
  {
    id: "TXN-8F28C1A9",
    customer: "CUS-002941",
    amount: "$42,000",
    type: "Wire Transfer",
    route: "CA → SG",
    risk: "Critical",
    score: 100,
    time: "2 min ago",
  },
  {
    id: "TXN-A841F220",
    customer: "CUS-008214",
    amount: "$22,500",
    type: "Wire Transfer",
    route: "US → SG",
    risk: "High",
    score: 65,
    time: "11 min ago",
  },
  {
    id: "TXN-7764DC91",
    customer: "CUS-001457",
    amount: "$7,840",
    type: "ACH Transfer",
    route: "US → US",
    risk: "Medium",
    score: 35,
    time: "18 min ago",
  },
  {
    id: "TXN-19A5B6E2",
    customer: "CUS-005611",
    amount: "$525.75",
    type: "Card Payment",
    route: "US → US",
    risk: "Low",
    score: 0,
    time: "25 min ago",
  },
  {
    id: "TXN-0CC491D8",
    customer: "CUS-003802",
    amount: "$15,200",
    type: "Cash Withdrawal",
    route: "GB → GB",
    risk: "High",
    score: 55,
    time: "38 min ago",
  },
];


export const policies = [
  {
    id: "POL-003",
    title: "Wire Transfer Monitoring",
    category: "Wire Transfer",
    match: "94%",
    description:
      "Enhanced monitoring guidance for high-value wire transfers and international movement of funds.",
  },
  {
    id: "POL-002",
    title: "Cross-Border Transaction Review",
    category: "International",
    match: "89%",
    description:
      "Review requirements for transactions crossing jurisdictions and customer geographic patterns.",
  },
  {
    id: "POL-001",
    title: "High-Value Transaction Review",
    category: "Monitoring",
    match: "86%",
    description:
      "Guidance for transactions exceeding normal customer behavior or monitoring thresholds.",
  },
];


export const auditEvents = [
  {
    type: "AI_EXPLANATION_CREATED",
    time: "14:31:12",
    service: "AI Service",
    transaction: "TXN-8F28C1A9",
  },
  {
    type: "RISK_ASSESSMENT_CREATED",
    time: "14:31:04",
    service: "Compliance Engine",
    transaction: "TXN-8F28C1A9",
  },
  {
    type: "TRANSACTION_CREATED",
    time: "14:30:58",
    service: "Transaction API",
    transaction: "TXN-8F28C1A9",
  },
  {
    type: "AI_EXPLANATION_CREATED",
    time: "14:21:33",
    service: "AI Service",
    transaction: "TXN-A841F220",
  },
  {
    type: "RISK_ASSESSMENT_CREATED",
    time: "14:21:26",
    service: "Compliance Engine",
    transaction: "TXN-A841F220",
  },
];
