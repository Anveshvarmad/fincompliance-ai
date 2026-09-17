#!/usr/bin/env bash

set -e

echo ""
echo "=== PODS ==="
kubectl get pods \
  -n fincompliance \
  -o wide

echo ""
echo "=== SERVICES ==="
kubectl get services \
  -n fincompliance

echo ""
echo "=== DEPLOYMENTS ==="
kubectl get deployments \
  -n fincompliance

echo ""
echo "=== STATEFULSETS ==="
kubectl get statefulsets \
  -n fincompliance

echo ""
echo "=== PVCs ==="
kubectl get pvc \
  -n fincompliance

echo ""
echo "=== JOBS ==="
kubectl get jobs \
  -n fincompliance
