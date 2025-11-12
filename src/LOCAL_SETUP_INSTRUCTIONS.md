# Local Setup Instructions for TrustLens

This guide provides step-by-step instructions to set up Firebase and run the TrustLens application on your local machine.

**Important:** This application uses Google's Gemini Pro model via Genkit for all review analysis. The Python ML service included in the `src/backend/ml_service` directory is **optional** and intended only for demonstrating the model training process. **You do not need to run the Python service to use the main application.**

## Prerequisites

1.  **Node.js**: Make sure you have Node.js version 18 or later installed.
2.  **npm**: Node.js package manager, installed with Node.js.
3.  **Google Cloud Account**: A Google Cloud account is required to use Firebase and Genkit's AI features.
4.  **Firebase Project**: You will need a Firebase project. You can create one for free in the [Firebase Console](https://console.firebase.google.com/).

## Step 1: Set Up Firebase and Google Cloud

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2.  **Enable Firebase Authentication**:
    *   In your new project, go to the **Authentication** section and click "Get started".
    *   Enable the **Email/Password** sign-in method.

3.  **Enable the AI Platform API**:
    *   In the [Google Cloud Console](https://console.cloud.google.com/), ensure you have selected the same project you created for Firebase.
    *   Go to the "APIs & Services" > "Library" and search for **"Vertex AI API"**.
    *   Click **Enable**. This is required for Genkit to access Google's Gemini models.

4.  **Get Frontend Firebase Configuration**:
    *   In the Firebase Console, go to your Project Settings (click the gear icon).
    *   In the "General" tab, scroll down to "Your apps".
    *   Click the **Web** icon (`</>`) to register a new web app.
    *   Give it a nickname (e.g., `TrustLens Frontend`) and click "Register app".
    *   You will be shown a `firebaseConfig` object. **Copy this object**.

5.  **Create a `.env` file**:
    *   In the root directory of your project, create a new file named `.env`.
    *   Paste the values from your `firebaseConfig` object into this file, prefixed with `NEXT_PUBLIC_`. It should look like this:

        ```
        NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
        NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."
        ```

    *   This `.env` file is where you will store all your secret keys.

## Step 2: Install Frontend Dependencies

Open a terminal, navigate to the root directory of the project, and run `npm install`.

```bash
npm install
```

## Step 3: Run the Next.js Frontend

In your terminal (from the project root), run the following command to start the Next.js development server.

```bash
npm run dev
```

Your application is now running at: **http://localhost:9002**

## Step 4: Create an Admin User

The application has a protected `/admin` route. To create an admin user:
1.  **Sign Up:** Go to the application at `http://localhost:9002/signup` and sign up for a new account using the email `admin@trustlens.com` and a strong password.
2.  **Go to Firebase Console:** Navigate to the **Authentication** section of your Firebase project.
3.  **Find the User:** In the **Users** tab, find the account you just created.
4.  **Edit User:** Click the three-dots menu (⋮) on the right side of that user's row and select **"Edit user"**.
5.  **Add Custom Claim:** In the modal that appears, click the **"Add custom claim"** button.
6.  **Set Claim:**
    *   Claim name: `role`
    *   Claim value: `admin`
7.  **Save:** Click **Save** to apply the custom claim.
8.  **Log In:** Log out of the application and log back in with the user you just promoted. You should now see the "Admin" link in the sidebar and be able to access the admin dashboard.


---

## Optional: Running the ML Model Training Process

If you wish to experiment with training the local ML model (this is **not required** for the app to work), follow these steps.

**Prerequisites**:
- **Python**: Make sure you have Python version 3.9 or later installed.
- **pip**: Python package manager.

1.  **Set Up Google Cloud Authentication for Translation (Optional)**: The training script can use Google Translate. To enable this, you need to authenticate.
    *   In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts".
    *   Create a service account, grant it the `Cloud Translation API User` role, and download its JSON key.
    *   Set an environment variable named `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of the JSON key file.
        *   **Mac/Linux**: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"`
        *   **Windows**: `setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\your\key.json"`

2.  **Create a Virtual Environment**: In a new terminal, from the project root:
    ```bash
    # Create
    python -m venv venv
    # Activate (Mac/Linux)
    source venv/bin/activate
    # Activate (Windows)
    .\venv\Scripts\activate
    ```
3.  **Install Python Dependencies**:
    ```bash
    pip install -r src/backend/ml_service/requirements.txt
    ```
4.  **Run the Training Script**:
    ```bash
    python -m src.backend.ml_service.train
    ```
    This will train the models and save the artifacts in the `src/backend/ml_service/models/` directory, printing evaluation metrics to your console.
