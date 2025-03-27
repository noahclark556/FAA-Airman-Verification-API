# FAA Airman Verification API

**Written by**: Noah Clark 

**Date Created**: ~2024-07-01

**Last Updated**: 2025-01-23

**Language**: JavaScript/TypeScript

**Target Platform**: Cloud Run (Google Cloud) Docker Image

**Development Environment**: macOS Sequoia 15.2, MacBook M2 Pro 2023 14-inch

## Description

This API allows the caller to verify a pilot's credentials via the FAA's public fixed length pilot database. This API does not use the pilots certificate number, but rather the pilots first name, middle name, last name. It will return a list of pilots that match the given name as well as their address and certificates, which you can then match their provided information or id.

I originally wrote this API for use within the Cloud Capture mobile app so that myself and the other developers could quickly verify a pilot's credentials, this worked very well and quickly. I had previously written this API in PHP and hosted it on my web server, but it was slow and definitely oldschool. So I decided to rewrite it in JavaScript/TypeScript and host it on Google Cloud.

Please note, not all pilots opt in to make their information public, so this API may not return any results for some pilots. It is recommended to use the FAA's online airman inquiry portal for more accurate results, but this API is very fast and works well for quick verification if implemented correctly.

I am not in any way affiliated with the FAA, and neither is this API, the only information used from the FAA is their public fixed length pilot database which is not included in this repository but is required to deploy this API.

## Important Note
**Firebase emulators cannot be running while trying to authenticate with the `gcloud` CLI.**

### Download Database from FAA

1. Download the fixed-length files, ensure you click the .zip option under "Fixed Length Format" [here](https://www.faa.gov/licenses_certificates/airmen_certification/releasable_airmen_download).

2. Place `PILOT.txt` in the root directory of this API (same directory as `package.json`).

### Project Setup
1. **Clone this repository:**

2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Build the project:**
    ```bash
    npm run build
    ```
    or
     ```bash
    npx tsc
    ```
4. **Test locally:**
    ```bash
    npm run start
    ```
    or
    ```bash
    node /dist/index.js
    ```
5. **Call local API with this curl command (or similar)**
    ```bash
    curl -X GET "http://localhost:8080/faaPilotVerifyV2?fName=firstnamehere&mName=middlenamehere&lName=lastnamehere&maxMatches=5&apikey=custom_api_key_here"
    ```
    
6. **Deploy to Cloud Run:**
    See Deployment Instructions below.

### Authenticate with Google Cloud CLI
1. **Login to CLI:**
    ```bash
    gcloud auth login
    ```

2. **Set the Account:**
    ```bash
    gcloud config set account account@email.com
    ```

3. **Set the Project:**
    ```bash
    gcloud config set project qc-apis
    ```

### Create Required Files
- **Dockerfile**
- **index.js**
- **Run `npm init`** to initialize your project.

## Deployment Instructions

### Build and Submit Docker Image
This step needs to be run every time the code changes:

```bash
gcloud builds submit --tag gcr.io/{your-project}/faasearchv2
```

### Deploy to Cloud Run
```bash
gcloud run deploy faasearchv2 --image gcr.io/{your-project}/faasearchv2 --platform managed
```
> **Note:** Use number `33` for `us-east1`.

## Useful Commands

### Get the URL of the Deployed Function
```bash
gcloud run services describe faasearchv2 --platform managed --format="get(status.url)"
```

### Set the Default Region
```bash
gcloud config set run/region us-east1
```

### Grant Permissions (if Permission Error Occurs)
```bash
gcloud projects add-iam-policy-binding {your-project} --member "DEFAULT_SERVICE_ACCOUNT_HERE" --role "roles/storage.admin"
```

### Run and Test Locally
```bash
PORT=3001 node index.js
```

### Upgrade Memory Limit
```bash
gcloud run services update faasearchv2 --memory 4Gi
```
