# Google Cloud Vision API Setup

The facial health and iridology features use **Google Cloud Vision API** instead of OpenAI due to OpenAI's restrictions on facial analysis.

## Why Google Cloud Vision?

OpenAI's GPT-4o has hard-coded restrictions that prevent facial recognition and facial feature analysis for privacy and ethical reasons. Google Cloud Vision API allows facial landmark detection and emotion analysis, which works for wellness tracking purposes.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project (required for Vision API)

### 2. Enable Vision API

1. In your Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Cloud Vision API"
3. Click **Enable**

### 3. Create Service Account Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the service account details and click **Create**
4. Grant the role **Cloud Vision API User** and click **Continue**
5. Click **Done**

### 4. Generate JSON Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - this will download a JSON file

### 5. Add Credentials to Environment Variables

You have two options:

#### Option A: Using JSON String (Recommended for Vercel/Cloud)

1. Open the downloaded JSON file
2. Copy the entire JSON content
3. Add to your `.env.local` file:

```env
GOOGLE_CLOUD_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project",...}'
```

**Important**: Wrap the JSON in single quotes and keep it on one line.

#### Option B: Using File Path (Local Development)

1. Save the JSON file to a secure location (NOT in your git repo)
2. Add to your `.env.local` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-credentials.json
```

### 6. Add to .gitignore

Make sure your credentials are not committed to git:

```
.env.local
google-credentials.json
*-credentials.json
```

### 7. Restart Your Development Server

```bash
npm run dev
```

## Pricing

Google Cloud Vision API pricing (as of 2025):

- First 1,000 units per month: **FREE**
- Face Detection: $1.50 per 1,000 images after free tier
- Label Detection: $1.50 per 1,000 images after free tier

For personal wellness tracking with weekly check-ins, you'll likely stay within the free tier.

## Testing

After setup, test the facial analysis by:

1. Going to `/vision/weekly-check`
2. Uploading a selfie for facial health analysis
3. Uploading eye close-ups for iridology analysis

## Troubleshooting

### Error: "Google Cloud credentials not found"

- Make sure `GOOGLE_CLOUD_CREDENTIALS_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` is set in `.env.local`
- Restart your dev server after adding environment variables

### Error: "Permission denied" or "API not enabled"

- Ensure Vision API is enabled in your Google Cloud Console
- Verify your service account has the "Cloud Vision API User" role

### Error: "No face detected"

- Ensure the photo clearly shows your face
- Use good lighting
- Make sure the face is not too small in the frame

## Security Notes

- **Never commit your credentials JSON to git**
- Keep your service account JSON file secure
- Consider using Google Cloud IAM to restrict service account permissions
- For production, use environment variables or secret management systems