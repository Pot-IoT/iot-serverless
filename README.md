# IOT Serverless

A serverless repo for manage file upload and download

### Setup

```bash
npm install

npm install -g serverless
```

### Run locally

```bash
serverless offline
```

### Deploy

Login to AWS -> IAM -> users -> serverless-admin -> view key and secret.

```bash
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>

serverless config credentials --provider aws --key key --secret secret

# Deploy to Prod
serverless deploy

# Deploy to Dev
serverless deploy --stage dev
```

```bash
# Prod Endpoint:
https://w0zawosezd.execute-api.eu-west-2.amazonaws.com/prod

# Dev Endpoint:
https://wvexfub6je.execute-api.eu-west-2.amazonaws.com/dev

```
