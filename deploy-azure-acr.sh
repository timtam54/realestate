#!/bin/bash

# Azure Container Registry build and deployment script
# This script builds in ACR and deploys to Azure Container Apps

set -e  # Exit on error

echo "=== BuySel Azure Deployment Script ==="
echo

# Set Azure subscription
echo "Setting Azure subscription..."
az account set --subscription "RoofSafetySolutionSub"
CURRENT_SUB=$(az account show --query name -o tsv)
echo "Using subscription: $CURRENT_SUB"
echo

# Configuration
RESOURCE_GROUP="PlantAllocation"
LOCATION="australiaeast"
APP_NAME="buyselapp"
REGISTRY_NAME="buyselregistry"

# Load environment variables from .env and .env.local
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Verify required environment variables
echo "1. Verifying environment variables..."
required_vars=(
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "AZURE_AD_CLIENT_ID"
    "AZURE_AD_CLIENT_SECRET"
    "AZURE_AD_TENANT_ID"
    "FACEBOOK_CLIENT_ID"
    "FACEBOOK_CLIENT_SECRET"
    "NEXT_PUBLIC_GOOGLE_MAP_API"
    "NEXT_PUBLIC_AZUREBLOB_CONTAINER"
    "NEXT_PUBLIC_AZUREBLOB_SASTOKEN"
    "NEXT_PUBLIC_AZUREBLOB_SASURL_BASE"
    "NEXT_PUBLIC_PUSHER_KEY"
    "NEXT_PUBLIC_PUSHER_CLUSTER"
    "PUSHER_APP_ID"
    "PUSHER_API_KEY"
    "PUSHER_SECRET"
    "PUSHER_CLUSTER"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "ERROR: Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo "All required environment variables are set."

# Get registry server
REGISTRY_SERVER=$(az acr show --name $REGISTRY_NAME --query loginServer -o tsv)
echo "Registry: $REGISTRY_SERVER"

# Check for version parameter
if [ -z "$1" ]; then
    echo "ERROR: Version parameter required"
    echo "Usage: ./deploy-azure-acr.sh <version>"
    echo "Example: ./deploy-azure-acr.sh v1.0.0"
    exit 1
fi

VERSION="$1"
IMAGE_TAG="$VERSION"
echo "Image tag: $IMAGE_TAG"

# Note: .env.production file should exist with all NEXT_PUBLIC_ variables
echo -e "\n2. Checking .env.production file..."
if [ -f .env.production ]; then
    echo ".env.production file exists"
else
    echo "Creating .env.production file..."
    cat > .env.production <<EOF
NEXT_PUBLIC_GOOGLE_MAP_API=$NEXT_PUBLIC_GOOGLE_MAP_API
NEXT_PUBLIC_AZUREBLOB_CONTAINER=$NEXT_PUBLIC_AZUREBLOB_CONTAINER
NEXT_PUBLIC_AZUREBLOB_SASTOKEN=$NEXT_PUBLIC_AZUREBLOB_SASTOKEN
NEXT_PUBLIC_AZUREBLOB_SASURL_BASE=$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE
NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER
EOF
fi

# Build the image using Azure Container Registry with acb.yaml
# The .env.production file is copied into the build context and used by Next.js
echo -e "\n3. Building image in Azure Container Registry..."
az acr run \
    --registry $REGISTRY_NAME \
    --file acb.yaml \
    --set IMAGE_TAG=$IMAGE_TAG \
    .

# Note: Keep .env.production file for future builds

# Check if container app exists
echo -e "\n4. Checking if container app exists..."
if az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
    echo "Container app exists. Updating it..."
    
    # Get the actual FQDN for NEXTAUTH_URL
    ACTUAL_FQDN=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
    
    # Update the container app with all environment variables
    az containerapp update \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --image $REGISTRY_SERVER/$APP_NAME:$IMAGE_TAG \
        --set-env-vars \
            NEXTAUTH_URL="https://$ACTUAL_FQDN" \
            NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
            GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
            AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
            AZURE_AD_CLIENT_SECRET="$AZURE_AD_CLIENT_SECRET" \
            AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
            FACEBOOK_CLIENT_ID="$FACEBOOK_CLIENT_ID" \
            FACEBOOK_CLIENT_SECRET="$FACEBOOK_CLIENT_SECRET" \
            NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
            NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
            NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
            NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API" \
            NEXT_PUBLIC_PUSHER_KEY="$NEXT_PUBLIC_PUSHER_KEY" \
            NEXT_PUBLIC_PUSHER_CLUSTER="$NEXT_PUBLIC_PUSHER_CLUSTER" \
            PUSHER_APP_ID="$PUSHER_APP_ID" \
            PUSHER_API_KEY="$PUSHER_API_KEY" \
            PUSHER_SECRET="$PUSHER_SECRET" \
            PUSHER_CLUSTER="$PUSHER_CLUSTER"
else
    echo "Container app does not exist. Creating it..."
    
    # Check if environment exists
    echo "Checking container app environment..."
    if ! az containerapp env show --name $APP_NAME-env --resource-group $RESOURCE_GROUP &>/dev/null; then
        echo "Creating container app environment..."
        az containerapp env create \
            --name $APP_NAME-env \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION
    fi
    
    # Get registry credentials
    echo "Getting registry credentials..."
    REGISTRY_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username -o tsv)
    REGISTRY_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value -o tsv)
    
    # Create the container app with all environment variables
    echo "Creating container app..."
    az containerapp create \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --environment $APP_NAME-env \
        --image $REGISTRY_SERVER/$APP_NAME:$IMAGE_TAG \
        --target-port 3000 \
        --ingress external \
        --registry-server $REGISTRY_SERVER \
        --registry-username $REGISTRY_USERNAME \
        --registry-password $REGISTRY_PASSWORD \
        --cpu 0.5 \
        --memory 1 \
        --min-replicas 1 \
        --max-replicas 3 \
        --env-vars \
            NEXTAUTH_URL="https://$APP_NAME.$LOCATION.azurecontainerapps.io" \
            NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
            GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
            AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
            AZURE_AD_CLIENT_SECRET="$AZURE_AD_CLIENT_SECRET" \
            AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
            FACEBOOK_CLIENT_ID="$FACEBOOK_CLIENT_ID" \
            FACEBOOK_CLIENT_SECRET="$FACEBOOK_CLIENT_SECRET" \
            NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
            NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
            NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
            NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API" \
            NEXT_PUBLIC_PUSHER_KEY="$NEXT_PUBLIC_PUSHER_KEY" \
            NEXT_PUBLIC_PUSHER_CLUSTER="$NEXT_PUBLIC_PUSHER_CLUSTER" \
            PUSHER_APP_ID="$PUSHER_APP_ID" \
            PUSHER_API_KEY="$PUSHER_API_KEY" \
            PUSHER_SECRET="$PUSHER_SECRET" \
            PUSHER_CLUSTER="$PUSHER_CLUSTER"
fi

# Get the latest revision name
echo -e "\n5. Getting latest revision name..."
LATEST_REVISION=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.latestRevisionName -o tsv)
echo "Latest revision: $LATEST_REVISION"

# Restart the container app to ensure latest image is used
echo "Restarting container app..."
az containerapp revision restart \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --revision $LATEST_REVISION

# Get the app URL
echo -e "\n6. Getting app URL..."
URL=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo -e "\n✅ Deployment complete!"
echo "App URL: https://$URL"

# Show recent logs
echo -e "\n7. Recent logs:"
az containerapp logs show --name $APP_NAME --resource-group $RESOURCE_GROUP --tail 20

echo -e "\n=== Deployment Summary ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo "URL: https://$URL"
echo "Registry: $REGISTRY_SERVER"
echo
echo "To view logs: az containerapp logs show --name $APP_NAME --resource-group $RESOURCE_GROUP --follow"
echo "To check status: az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP"