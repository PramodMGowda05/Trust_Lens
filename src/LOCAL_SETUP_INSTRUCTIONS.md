# Local Setup Instructions for TrustLens

This guide provides step-by-step instructions to set up Firebase, train your own ML model, and run the full TrustLens application (both the Next.js frontend and the Python ML service) on your local machine.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js version 18 or later installed.
2.  **Python**: Make sure you have Python version 3.9 or later installed.
3.  **npm & pip**: Package managers for Node.js and Python, respectively.
4.  **Google Cloud Account**: A Google Cloud account is required to use Firebase and the Translation API.
5.  **Firebase Project**: You will need a Firebase project. You can create one for free in the [Firebase Console](https://console.firebase.google.com/).

## Step 1: Set Up Firebase and Google Cloud

The application now uses **Firebase Authentication** and the **Google Cloud Translation API**.

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2.  **Enable Firebase Authentication**:
    *   In your new project, go to the **Authentication** section and click "Get started".
    *   Enable the **Email/Password** sign-in method.

3.  **Enable the Translation API**:
    *   In the [Google Cloud Console](https://console.cloud.google.com/), make sure you have selected the same project you just created for Firebase.
    *   Go to the "APIs & Services" > "Library" and search for **"Cloud Translation API"**.
    *   Click **Enable**.

4.  **Create a Service Account for the Python Backend**:
    *   In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts".
    *   Click **+ CREATE SERVICE ACCOUNT**. Give it a name (e.g., `trustlens-backend`) and a description.
    *   Grant this service account two roles:
        1.  `Cloud Translation API User` (for the translation feature)
        2.  `Service Account User` (for general permissions)
    *   Click "Done". Find the service account you just created in the list and click on it.
    *   Go to the **KEYS** tab, click **ADD KEY** > **Create new key**.
    *   Choose **JSON** as the key type and click **CREATE**. A JSON file will be downloaded.

5.  **Set the `GOOGLE_APPLICATION_CREDENTIALS` Environment Variable**:
    *   You must set an environment variable that points to the absolute path of the JSON key file you just downloaded. This allows your Python backend to authenticate with Google Cloud services.
    *   **Mac/Linux**:
        ```bash
        export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"
        ```
    *   **Windows (Command Prompt)**:
        ```cmd
        setx GOOGLE_APPLICATION_CREDENTIALS "C:\path\to\your\key.json"
        ```
    *   **Windows (PowerShell)**:
        ```powershell
        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\key.json"
        ```
    *   **Important**: You must close and reopen your terminal for this change to take effect.

6.  **Get Frontend Firebase Configuration**:
    *   In the Firebase Console, go to your Project Settings (click the gear icon).
    *   In the "General" tab, scroll down to "Your apps".
    *   Click the **Web** icon (`</>`) to register a new web app.
    *   Give it a nickname (e.g., `TrustLens Frontend`) and click "Register app".
    *   You will be shown a `firebaseConfig` object. **Copy this object**.

7.  **Add Firebase Config to Your Frontend**:
    *   The file `src/firebase/config.ts` should already exist. If not, create it.
    *   Replace the contents of this file with your `firebaseConfig` object:
        ```typescript
        // src/firebase/config.ts
        export const firebaseConfig = {
          // Paste your copied config object here
          apiKey: "AIza...",
          authDomain: "your-project.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project.appspot.com",
          messagingSenderId: "...",
          appId: "1:...",
          measurementId: "G-..."
        };
        ```

## Step 2: Install Frontend Dependencies

Open a terminal, navigate to the root directory of the project, and run `npm install`.

```bash
npm install
```

## Step 3: Set Up the Python ML Backend

1.  **Navigate to Project Root**: In a new terminal, ensure you are in the project's root directory.
2.  **Create and Activate a Virtual Environment**:
    ```bash
    # Create
    python -m venv venv
    # Activate (Mac/Linux)
    source venv/bin/activate
    # Activate (Windows)
    .\venv\Scripts\activate
    ```
3.  **Install Python Dependencies**: Run this command to install all required packages.
    ```bash
    pip install -r src/backend/ml_service/requirements.txt
    ```

## Step 4: Train Your Custom ML Model

1.  **Run the Training Script**: From the **root directory** (with your virtual environment active), run the training script as a module.
    ```bash
    python -m src.backend.ml_service.train
    ```
2.  **Review the Output**: The script will train the models and save `embedder.joblib` and `clf.joblib` into the `src/backend/ml_service/models/` directory.

## Step 5: Run the Backend and Frontend

You now need two terminals open simultaneously.

1.  **Terminal 1: Run the Python ML Service**:
    *   From the project root (with venv active), start the Uvicorn server.
    ```bash
    uvicorn src.backend.ml_service.app:app --reload --port 5001
    ```
    *   Keep this running. It is your backend API.

2.  **Terminal 2: Run the Next.js Frontend**:
    *   From the project root, start the Next.js development server.
    ```bash
    npm run dev
    ```

Your application is now running!
*   Frontend is at: **http://localhost:9002**
*   Backend is at: **http://localhost:5001**

## Step 6: Create an Admin User

The application has a protected `/admin` route. To create an admin user:
1.  **Sign Up:** Go to the application at `http://localhost:9002/signup` and sign up for a new account. You can use an email like `admin@trustlens.com` for clarity.
2.  **Go to Firebase Console:** Navigate to the **Authentication** section of your Firebase project.
3.  **Find the User:** In the **Users** tab, find the account you just created.
4.  **Edit User:** Click the three-dots menu (⋮) on the right side of that user's row and select **"Edit user"**.
5.  **Add Custom Claim:** In the modal that appears, click the **"Add custom claim"** button.
6.  **Set Claim:**
    *   Claim name: `role`
    *   Claim value: `admin`
7.  **Save:** Click **Save** to apply the custom claim.
8.  **Log In:** Log out of the application and log back in with the user you just promoted. You should now see the "Admin" link in the sidebar and be able to access the admin dashboard.
