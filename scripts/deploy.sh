#!/bin/bash
set -euo pipefail

# Deploy ShipWithAI to Google Cloud Run.
#
# Two modes:
#   ./scripts/deploy.sh              -> build + push + deploy
#   ./scripts/deploy.sh --no-build   -> redeploy the existing :latest image
#
# Assumes you've already authenticated docker against Artifact Registry:
#   gcloud auth configure-docker europe-west1-docker.pkg.dev

PROJECT_ID="${GCLOUD_PROJECT:-bright-union}"
REGION="${CLOUD_RUN_REGION:-europe-west1}"
SERVICE_NAME="agentverse"
IMAGE="europe-west1-docker.pkg.dev/${PROJECT_ID}/agentverse/web:latest"

SKIP_BUILD=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-build) SKIP_BUILD=true; shift ;;
    --project) PROJECT_ID="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ "$SKIP_BUILD" != "true" ]]; then
  echo "==> Building image (linux/amd64) ..."
  docker build --platform linux/amd64 -t "${IMAGE}" .

  echo "==> Pushing to Artifact Registry ..."
  docker push "${IMAGE}"
fi

echo "==> Deploying to Cloud Run (${REGION}) ..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=${PROJECT_ID},GITHUB_APP_ID=3237984,GITHUB_APP_INSTALLATION_ID=120479083,GITHUB_REPO_OWNER=kivanov82,NEXTAUTH_URL=https://shipwithai.nl,SHIPWITHAI_FREE_MODE=false,NEXT_PUBLIC_SHIPWITHAI_FREE_MODE=false,NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=07ff29b12b310194d598c77acaabdbab" \
  --update-secrets="ANTHROPIC_API_KEY=anthropic-api-key:latest,GITHUB_PAT=github-pat:latest,GITHUB_APP_PRIVATE_KEY=github-app-private-key:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,NEXTAUTH_SECRET=nextauth-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,BRAVE_SEARCH_API_KEY=brave-search-api-key:latest,E2B_API_KEY=e2b-api-key:latest"

echo "==> Done."
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)"
