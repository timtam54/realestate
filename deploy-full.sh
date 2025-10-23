#!/bin/bash

# Full deployment script with all environment variables
# This script builds and deploys the BuySel app to Azure Container Apps

set -e  # Exit on error

echo "=== BuySel Full Deployment Script ==="
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

# Build the Docker image
echo -e "\n2. Building Docker image..."
docker build -t $APP_NAME:latest \
    --build-arg NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API" \
    --build-arg NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
    --build-arg NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
    --build-arg NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
    --build-arg NEXT_PUBLIC_PUSHER_KEY="$NEXT_PUBLIC_PUSHER_KEY" \
    --build-arg NEXT_PUBLIC_PUSHER_CLUSTER="$NEXT_PUBLIC_PUSHER_CLUSTER" \
    .

# Login to Azure Container Registry
echo -e "\n3. Logging in to Azure Container Registry..."
az acr login --name $REGISTRY_NAME

# Tag and push the image
echo -e "\n4. Tagging and pushing image to registry..."
REGISTRY_SERVER=$(az acr show --name $REGISTRY_NAME --query loginServer -o tsv)
docker tag $APP_NAME:latest $REGISTRY_SERVER/$APP_NAME:latest
docker push $REGISTRY_SERVER/$APP_NAME:latest

# Check if container app exists
echo -e "\n5. Checking if container app exists..."
if az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
    echo "Container app exists. Updating it..."
    
    # Update the container app with all environment variables
    az containerapp update \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --image $REGISTRY_SERVER/$APP_NAME:latest \
        --set-env-vars \
            NEXTAUTH_URL="https://$APP_NAME.$LOCATION.azurecontainerapps.io" \
            NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
            GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
            AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
            AZURE_AD_CLIENT_SECRET="$AZURE_AD_CLIENT_SECRET" \
            AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
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
        --image $REGISTRY_SERVER/$APP_NAME:latest \
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