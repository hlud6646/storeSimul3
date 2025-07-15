#!/bin/bash

# Script to build and push all microservices to Amazon ECR
# Excludes hello-world-server and database (which uses pre-built image)

set -e  # Exit on any error

# Configuration
ECR_REGISTRY="public.ecr.aws/r7q9b4d1"
IMAGE_PREFIX="store"
REGION="us-east-1"

# Services to build and push (based on docker-compose.yml)
SERVICES=(
    "products"
    "suppliers" 
    "customers"
    "orders"
    "dashboard-api"
    "dashboard"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions for colored output
echo_success() {
    echo -e "${GREEN}$1${NC}"
}

echo_failure() {
    echo -e "${RED}$1${NC}"
}

echo_info() {
    echo -e "${YELLOW}$1${NC}"
}

echo_warning() {
    echo -e "${BLUE}$1${NC}"
}

echo_info "Starting build and push for all microservices..."
echo_info "ECR Registry: ${ECR_REGISTRY}"
echo_info "Region: ${REGION}"
echo ""

# Check if logged into ECR
echo_info "Checking ECR login status..."
if ! docker images ${ECR_REGISTRY}/store/test:latest &>/dev/null; then
    echo_info "Attempting to log into ECR..."
    aws ecr-public get-login-password --region ${REGION} | docker login --username AWS --password-stdin public.ecr.aws
fi

# Function to build and push a service
build_and_push_service() {
    local service=$1
    echo_success "\n==== Processing service: ${service} ===="
    
    # Check if directory exists
    if [ ! -d "${service}" ]; then
        echo_failure "Error: Directory ${service} does not exist"
        return 1
    fi
    
    # Change to service directory
    cd "${service}"
    
    # Build the image
    echo_info "Building ${service}..."
    if docker build -t ${IMAGE_PREFIX}/${service} .; then
        echo_success "✓ Build successful for ${service}"
    else
        echo_failure "✗ Build failed for ${service}"
        cd ..
        return 1
    fi
    
    # Tag for ECR
    echo_info "Tagging ${service} for ECR..."
    docker tag ${IMAGE_PREFIX}/${service}:latest ${ECR_REGISTRY}/${IMAGE_PREFIX}/${service}:latest
    
    # Push to ECR
    echo_info "Pushing ${service} to ECR..."
    if docker push ${ECR_REGISTRY}/${IMAGE_PREFIX}/${service}:latest; then
        echo_success "✓ Push successful for ${service}"
    else
        echo_failure "✗ Push failed for ${service}"
        cd ..
        return 1
    fi
    
    # Return to root directory
    cd ..
    echo_success "✓ Completed ${service}"
}

# Track success/failure
SUCCESSFUL_SERVICES=()
FAILED_SERVICES=()

# Process each service
for service in "${SERVICES[@]}"; do
    if build_and_push_service "$service"; then
        SUCCESSFUL_SERVICES+=("$service")
    else
        FAILED_SERVICES+=("$service")
        echo_failure "Failed to process ${service}, continuing with others..."
    fi
done

# Summary
echo_info "\n==== SUMMARY ===="
echo_success "Successful services (${#SUCCESSFUL_SERVICES[@]}):"
for service in "${SUCCESSFUL_SERVICES[@]}"; do
    echo_success "  ✓ ${service}"
done

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo_failure "\nFailed services (${#FAILED_SERVICES[@]}):"
    for service in "${FAILED_SERVICES[@]}"; do
        echo_failure "  ✗ ${service}"
    done
    exit 1
else
    echo_success "\n🎉 All services built and pushed successfully!"
fi 
