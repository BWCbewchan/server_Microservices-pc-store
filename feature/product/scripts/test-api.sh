#!/bin/bash

# Base URL - Replace with your actual API URL
API_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Products API Filters${NC}\n"

# Function to make API calls and format response
call_api() {
    local description=$1
    local endpoint=$2
    echo -e "${GREEN}Testing: $description${NC}"
    echo "GET $endpoint"
    curl -s "$endpoint" | json_pp
    echo -e "\n----------------------------------------\n"
}

# 1. Get all products (default pagination: page 1, limit 12)
call_api "Get all products" "$API_URL/products-filters"

# 2. Filter by category
call_api "Filter Gaming Laptops" "$API_URL/products-filters?category=Gaming%20Laptops"

# 3. Filter by price range (599-1500)
call_api "Filter by price range 599-1500" "$API_URL/products-filters?priceRange=599-1500"

# 4. Search by name
call_api "Search MSI products" "$API_URL/products-filters?name=MSI"

# 5. Sort by price (ascending)
call_api "Sort by price (low to high)" "$API_URL/products-filters?sort=price_asc"

# 6. Sort by rating (descending)
call_api "Sort by rating (high to low)" "$API_URL/products-filters?sort=rating_desc"

# 7. Pagination (page 2, limit 5)
call_api "Pagination - Page 2, Limit 5" "$API_URL/products-filters?page=2&limit=5"

# 8. Combined filters
call_api "Combined filters" "$API_URL/products-filters?category=Custom%20PCs&priceRange=1000-3000&sort=price_desc" 