# CI/CD Pipeline Setup Guide

This guide will help you set up automated deployment of your Yatta Golf app to AWS whenever you push code to the main branch.

## Prerequisites

- AWS Account with access to credentials
- GitHub repository (you already have this)
- Node.js 18+ installed locally

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Enter a bucket name (e.g., `yatta-golf-app`)
   - Bucket names must be globally unique
   - Use lowercase letters, numbers, and hyphens
4. Select your preferred region (e.g., `us-east-1`)
5. **Uncheck** "Block all public access" (we need this for web hosting)
6. Click "Create bucket"

### Configure S3 for Web Hosting

1. Select your bucket from the list
2. Go to "Properties" tab
3. Scroll to "Static website hosting"
4. Click "Edit"
5. Enable "Static website hosting"
6. Set Index document to: `index.html`
7. Set Error document to: `index.html` (for client-side routing)
8. Click "Save changes"
9. Copy the "Bucket website endpoint" URL (you'll need this later)

### Set Bucket Policy for Public Access

1. Go to "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy (replace `yatta-golf-app` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::yatta-golf-app/*"
    }
  ]
}
```

5. Click "Save changes"

## Step 2: Create CloudFront Distribution

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click "Create distribution"
3. For "Origin", select your S3 bucket website endpoint (NOT the bucket itself)
4. Set "Origin path" to `/` (empty)
5. Leave most settings as default, but:
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Compress objects automatically**: Yes
6. Under "Default root object": Enter `index.html`
7. Under "Error responses", create one for 404 errors:
   - HTTP status code: `404`
   - Error caching min TTL: `0`
   - Custom error response: Yes
   - Response page path: `/index.html`
   - HTTP response code: `200`
8. Click "Create distribution"
9. Wait for deployment to complete (check the Status column - it should say "Deployed")
10. Copy your **Distribution ID** (you'll need this for GitHub)
11. Copy your **Distribution domain name** (something like `d123456.cloudfront.net`)

## Step 3: Add AWS Credentials to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add three secrets:

**Secret 1:**

- Name: `AWS_ACCESS_KEY_ID`
- Value: Your AWS Access Key ID

**Secret 2:**

- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Your AWS Secret Access Key

**Secret 3:**

- Name: `S3_BUCKET_NAME`
- Value: Your bucket name (e.g., `yatta-golf-app`)

**Secret 4:**

- Name: `CLOUDFRONT_DISTRIBUTION_ID`
- Value: Your CloudFront Distribution ID

## Step 4: Fix the Build Script

The GitHub Actions workflow uses `npm run dev -- --build` which may not work correcty. Update your `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "playwright test"
}
```

Then update the workflow to use `npm run build` instead.

## Step 5: Test the Pipeline

1. Push a small change to your main branch
2. Go to your GitHub repository → "Actions" tab
3. Watch the workflow run:
   - Install dependencies
   - Run tests
   - Build the app
   - Deploy to S3
   - Clear CloudFront cache
4. Once complete, visit your CloudFront domain name to see your app live!

## Debugging

If the deployment fails:

1. Check the GitHub Actions logs for errors
2. Common issues:
   - **Tests failing**: Fix the tests before pushing
   - **Build errors**: Check the build output in the logs
   - **AWS credential errors**: Verify the secrets are saved correctly in GitHub
   - **Permission denied**: Ensure your IAM user has S3 and CloudFront permissions

## Custom Domain (Optional)

To use a custom domain instead of the CloudFront domain:

1. Purchase a domain (Route53, GoDaddy, etc.)
2. In CloudFront, go to "Alternate domain names (CNAMEs)"
3. Add your custom domain
4. Update your domain's DNS to point to the CloudFront distribution
5. Request an SSL certificate for your domain (CloudFront will provide instructions)

## Future Deployments

Once set up, every time you:

1. Commit changes to your code
2. Push to the main branch
3. The pipeline automatically runs tests, builds, and deploys

No manual steps needed!
