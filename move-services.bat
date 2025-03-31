@echo off

REM Auth Service
git checkout feature/auth/user-management
xcopy /E /I /Y auth-service\* feature\auth\*
git add .
git commit -m "Move auth-service to feature/auth branch"
git checkout develop

REM Cart Service
git checkout feature/cart/cart-operations
xcopy /E /I /Y cart-service\* feature\cart\*
git add .
git commit -m "Move cart-service to feature/cart branch"
git checkout develop

REM Product Service
git checkout feature/product/product-crud
xcopy /E /I /Y product-service\* feature\product\*
git add .
git commit -m "Move product-service to feature/product branch"
git checkout develop

REM Order Service
git checkout feature/order/order-processing
xcopy /E /I /Y order-service\* feature\order\*
git add .
git commit -m "Move order-service to feature/order branch"
git checkout develop

REM Payment Service
git checkout feature/payment/payment-integration
xcopy /E /I /Y payment-service\* feature\payment\*
git add .
git commit -m "Move payment-service to feature/payment branch"
git checkout develop

REM Inventory Service
git checkout feature/inventory/stock-management
xcopy /E /I /Y inventory-service\* feature\inventory\*
git add .
git commit -m "Move inventory-service to feature/inventory branch"
git checkout develop

REM Review Service
git checkout feature/review/review-management
xcopy /E /I /Y review-service\* feature\review\*
git add .
git commit -m "Move review-service to feature/review branch"
git checkout develop

REM Shipping Service
git checkout feature/shipping/shipping-calculation
xcopy /E /I /Y shipping-service\* feature\shipping\*
git add .
git commit -m "Move shipping-service to feature/shipping branch"
git checkout develop

echo Services have been moved to their respective branches!