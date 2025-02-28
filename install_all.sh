#!/bin/bash

SERVICES="api-gateway auth-service inventory-service order-service payment-service product-service review-service shipping-service"

for SERVICE in $SERVICES; do
  echo "Installing dependencies for $SERVICE..."
  cd $SERVICE && npm install && cd ..
done

echo "All dependencies installed!"
