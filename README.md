# IOT Serverless

A serverless repo for manage file upload and download

### Setup

```
npm install

npm install -g serverless
```

### Deploy

Login to

```
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>

serverless config credentials --provider aws --key key --secret secret

serverless deploy
```
