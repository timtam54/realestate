#!/bin/bash

# Set your Azure configuration
RESOURCE_GROUP="PlantAllocation"
LOCATION="australiaeast"
APP_NAME="buyselapp"
REGISTRY_NAME="buyselregistry"
IMAGE_TAG="latest"

# Create resource group if it doesn't exist
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry if it doesn't exist
az acr create --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --sku Basic

# Enable admin access
az acr update -n $REGISTRY_NAME --admin-enabled true

# Get registry credentials
REGISTRY_SERVER=$(az acr show --name $REGISTRY_NAME --query loginServer --output tsv)
REGISTRY_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username --output tsv)
REGISTRY_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value --output tsv)

# Build and push image with build arguments
az acr build --registry $REGISTRY_NAME --image $APP_NAME:$IMAGE_TAG \
  --build-arg NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
  --build-arg NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
  --build-arg NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
  --build-arg NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API" \
  --build-arg NEXT_PUBLIC_PUSHER_KEY="$NEXT_PUBLIC_PUSHER_KEY" \
  --build-arg NEXT_PUBLIC_PUSHER_CLUSTER="$NEXT_PUBLIC_PUSHER_CLUSTER" \
  .

# Create Container Apps environment if it doesn't exist
az containerapp env create \
  --name $APP_NAME-env \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy to Container Apps
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
    NEXTAUTH_URL="https://$APP_NAME.icymeadow-c7b88605.$LOCATION.azurecontainerapps.io" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
    AZURE_AD_CLIENT_ID="$AZURE_AD_CLIENT_ID" \
    AZURE_AD_CLIENT_SECRET="$AZURE_AD_CLIENT_SECRET" \
    AZURE_AD_TENANT_ID="$AZURE_AD_TENANT_ID" \
    NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
    NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
    NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
    NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API"

# Get the URL
echo "Application deployed to:"
az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv