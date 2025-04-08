@echo off
call git checkout main
call git pull origin main
call git checkout -b develop

REM Auth Service
call git checkout -b feature/auth/user-management
call git checkout develop
call git checkout -b feature/auth/authentication
call git checkout develop

REM Cart Service
call git checkout -b feature/cart/cart-operations
call git checkout develop
call git checkout -b feature/cart/cart-summary
call git checkout develop

REM Product Service
call git checkout -b feature/product/product-crud
call git checkout develop
call git checkout -b feature/product/image-handling
call git checkout develop

REM Order Service
call git checkout -b feature/order/order-processing
call git checkout develop
call git checkout -b feature/order/order-status
call git checkout develop

REM Payment Service
call git checkout -b feature/payment/payment-integration
call git checkout develop
call git checkout -b feature/payment/payment-verification
call git checkout develop

REM Inventory Service
call git checkout -b feature/inventory/stock-management
call git checkout develop
call git checkout -b feature/inventory/inventory-tracking
call git checkout develop

REM Review Service
call git checkout -b feature/review/review-management
call git checkout develop
call git checkout -b feature/review/rating-system
call git checkout develop

REM Shipping Service
call git checkout -b feature/shipping/shipping-calculation
call git checkout develop
call git checkout -b feature/shipping/tracking-system
call git checkout develop

REM Create release branch
call git checkout -b release/v1.0.0
call git checkout develop

echo Branch creation completed!