#!/bin/bash

REGISTRY_NAME="buyselregistry"
APP_NAME="buyselapp"
RESOURCE_GROUP="PlantAllocation"

echo "Rebuilding with environment variables..."

# Build with build arguments
az acr build \
  --registry $REGISTRY_NAME \
  --image $APP_NAME:latest \
  --build-arg NEXT_PUBLIC_AZUREBLOB_CONTAINER="$NEXT_PUBLIC_AZUREBLOB_CONTAINER" \
  --build-arg NEXT_PUBLIC_AZUREBLOB_SASTOKEN="$NEXT_PUBLIC_AZUREBLOB_SASTOKEN" \
  --build-arg NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="$NEXT_PUBLIC_AZUREBLOB_SASURL_BASE" \
  --build-arg NEXT_PUBLIC_GOOGLE_MAP_API="$NEXT_PUBLIC_GOOGLE_MAP_API" \
  .

# Update the container app to use the new image
echo "Updating container app with new image..."
az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image buyselregistry.azurecr.io/$APP_NAME:latest

echo "Deployment complete!"