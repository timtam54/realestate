#!/bin/bash

# Configuration
RESOURCE_GROUP="PlantAllocation"
LOCATION="australiaeast"
APP_NAME="buyselapp"
REGISTRY_NAME="buyselregistry"

echo "Checking current state..."

# Check if container app exists
echo "1. Checking if container app exists..."
if az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
    echo "Container app exists. Getting URL..."
    URL=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
    echo "App URL: https://$URL"
else
    echo "Container app does not exist. Creating it now..."
    
    # Check if environment exists
    echo "2. Checking container app environment..."
    if ! az containerapp env show --name $APP_NAME-env --resource-group $RESOURCE_GROUP &>/dev/null; then
        echo "Creating container app environment..."
        az containerapp env create \
            --name $APP_NAME-env \
            --resource-group $RESOURCE_GROUP \
            --location $LOCATION
    fi
    
    # Get registry credentials
    echo "3. Getting registry credentials..."
    REGISTRY_SERVER=$(az acr show --name $REGISTRY_NAME --query loginServer -o tsv)
    REGISTRY_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username -o tsv)
    REGISTRY_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value -o tsv)
    
    # Create the container app
    echo "4. Creating container app..."
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
            NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
            GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
            GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}" \
            NEXT_PUBLIC_AZUREBLOB_CONTAINER="${NEXT_PUBLIC_AZUREBLOB_CONTAINER}" \
            NEXT_PUBLIC_AZUREBLOB_SASTOKEN="${NEXT_PUBLIC_AZUREBLOB_SASTOKEN}" \
            NEXT_PUBLIC_AZUREBLOB_SASURL_BASE="${NEXT_PUBLIC_AZUREBLOB_SASURL_BASE}" \
            NEXT_PUBLIC_GOOGLE_MAP_API="${NEXT_PUBLIC_GOOGLE_MAP_API}"
    
    # Get the URL
    echo "5. Getting app URL..."
    URL=$(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
    echo "App deployed to: https://$URL"
fi

# Show app logs
echo -e "\n6. Recent logs:"
az containerapp logs show --name $APP_NAME --resource-group $RESOURCE_GROUP --tail 20