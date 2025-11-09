# Local Setup Instructions for TrustLens

This guide provides step-by-step instructions to train your own model and run the full TrustLens application (both the Next.js frontend and the Python ML service) on your local machine.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js version 18 or later installed.
2.  **Python**: Make sure you have Python version 3.9 or later installed.
3.  **npm**: Node.js package manager, installed with Node.js.
4.  **pip**: Python package manager, usually installed with Python.
5.  **Google Cloud Account & Credentials**: The translation feature requires a Google Cloud account with the "Cloud Translation API" enabled. You will also need to have a service account key.

## Step 1: Set Up Google Cloud Authentication

The Python service uses the Google Cloud Translation API. You must configure your local environment to authenticate with Google Cloud.

1.  **Enable the API**: Go to the Google Cloud Console and enable the "Cloud Translation API" for your project.
2.  **Create a Service Account**: In the "IAM & Admin" section, create a service account. Grant it the "Cloud Translation API User" role.
3.  **Download JSON Key**: Create a JSON key for the service account and download it to your computer.
4.  **Set Environment Variable**: Set an environment variable named `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of the JSON key file you downloaded.
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
        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to/your/key.json"
        ```
    *Note: You may need to close and reopen your terminal for this change to take effect.*

## Step 2: Install Frontend Dependencies

Open a terminal, navigate to the root directory of the project, and run the following command to install all the necessary Node.js packages for the Next.js frontend.

```bash
npm install
```

## Step 3: Set Up the Python ML Backend

You will need a second terminal for this step.

1.  **Navigate to the Service Directory**: In a new terminal, navigate to the Python service directory.
    ```bash
    cd src/backend/ml_service
    ```

2.  **Create a Virtual Environment (Recommended)**: It's best practice to create a virtual environment to manage Python dependencies.
    ```bash
    python -m venv venv
    ```

3.  **Activate the Virtual Environment**:
    *   **Mac/Linux**:
        ```bash
        source venv/bin/activate
        ```
    *   **Windows**:
        ```bash
        .\venv\Scripts\activate
        ```

4.  **Install Python Dependencies**: Install all the required Python packages using the `requirements.txt` file.
    ```bash
    pip install -r requirements.txt
    ```

## Step 4: Train Your Custom ML Model

Before running the service, you need to train your model. We have provided a sample dataset and a training script.

1.  **Run the Training Script**: From the `src/backend/ml_service` directory (with your virtual environment still active), run the `train.py` script.
    ```bash
    python train.py
    ```

2.  **Review the Output**: The script will load the `data/sample_reviews.csv`, train the models, show you evaluation metrics (like accuracy and a classification report), and save two files: `embedder.joblib` and `clf.joblib` into the `src/backend/ml_service/models/` directory.

3.  **(Optional) Use Your Own Data**: To train on your own data, simply replace `data/sample_reviews.csv` with your own CSV file. Make sure it has the same format: a `text` column for the review and a `label` column with `genuine` or `fake` values.

## Step 5: Run the Python ML Service

Now that you have your trained models, you can start the backend service.

1.  **Run the ML Service**: In the same terminal (inside `src/backend/ml_service` with the virtual environment active), start the Uvicorn server.
    ```bash
    uvicorn app:app --reload --port 5001
    ```
    Keep this terminal window open. The ML service is now running on `http://localhost:5001` and is ready to accept requests from the frontend.

## Step 6: Run the Next.js Frontend

Go back to your first terminal (at the project root). Run the following command to start the Next.js development server.

```bash
npm run dev
```

The frontend application will start and be accessible at **http://localhost:9002**.

## Summary

You should now have:
1.  One terminal running the **Python ML Service** on port 5001.
2.  Another terminal running the **Next.js Frontend** on port 9002.

You can now open `http://localhost:9002` in your browser, sign up for a new account or log in as the admin (`admin@trustlens.com` / `password`), and use the application. The frontend will make API calls to the Python backend you are running locally.
