#!/bin/bash

# This script creates an Azure service principal for GitHub Actions deployment
# and outputs the credentials in the format needed for GitHub secrets

echo "Creating Azure service principal for GitHub Actions..."
echo ""

# Get the subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Using subscription: $SUBSCRIPTION_ID"

# Create the service principal
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "github-actions-buysel-webapp" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/buysel \
  --sdk-auth)

echo ""
echo "============================================"
echo "Service principal created successfully!"
echo "============================================"
echo ""
echo "Copy the JSON below and add it as a GitHub secret named 'AZURE_CREDENTIALS':"
echo ""
echo "$SP_OUTPUT"
echo ""
echo "To add this secret to GitHub:"
echo "1. Go to https://github.com/timtam54/realestate/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: AZURE_CREDENTIALS"
echo "4. Value: Paste the JSON above"
echo "5. Click 'Add secret'"
