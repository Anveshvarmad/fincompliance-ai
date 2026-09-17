#!/usr/bin/env bash

set -e

NAMESPACE=fincompliance

pkill -f \
  "kubectl.*port-forward.*service/frontend.*5173:5173" \
  2>/dev/null || true

pkill -f \
  "kubectl.*port-forward.*service/backend.*8000:8000" \
  2>/dev/null || true

pkill -f \
  "kubectl.*port-forward.*service/event-service.*3001:3001" \
  2>/dev/null || true

pkill -f \
  "kubectl.*port-forward.*service/rabbitmq.*15672:15672" \
  2>/dev/null || true


nohup kubectl \
  -n "$NAMESPACE" \
  port-forward \
  service/frontend \
  5173:5173 \
  > .k8s-portforward-frontend.log \
  2>&1 &


nohup kubectl \
  -n "$NAMESPACE" \
  port-forward \
  service/backend \
  8000:8000 \
  > .k8s-portforward-backend.log \
  2>&1 &


nohup kubectl \
  -n "$NAMESPACE" \
  port-forward \
  service/event-service \
  3001:3001 \
  > .k8s-portforward-events.log \
  2>&1 &


nohup kubectl \
  -n "$NAMESPACE" \
  port-forward \
  service/rabbitmq \
  15672:15672 \
  > .k8s-portforward-rabbitmq.log \
  2>&1 &


sleep 4

echo ""
echo "Frontend:"
echo "  http://localhost:5173"

echo ""
echo "Backend:"
echo "  http://localhost:8000"

echo ""
echo "Event Service:"
echo "  http://localhost:3001"

echo ""
echo "RabbitMQ:"
echo "  http://localhost:15672"
