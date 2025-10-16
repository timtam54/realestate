#!/bin/bash

# Check if the container app exists
echo "Checking Container App status..."
az containerapp show --name buyselapp --resource-group PlantAllocation --query "properties.configuration.ingress.fqdn" -o tsv

# If that doesn't work, list all container apps
echo -e "\nListing all Container Apps in resource group..."
az containerapp list --resource-group PlantAllocation --query "[].{Name:name, URL:properties.configuration.ingress.fqdn}" -o table

# Check the environment
echo -e "\nChecking Container App Environment..."
az containerapp env list --resource-group PlantAllocation -o table

# Get full details
echo -e "\nGetting full app details..."
az containerapp show --name buyselapp --resource-group PlantAllocation -o yaml