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

serverless deploy
```
