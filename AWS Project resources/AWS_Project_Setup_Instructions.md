# AWS Project Setup Instructions

## Overview

This project includes AWS services such as Lambda functions, DynamoDB tables, API Gateway, SNS topics, and Cognito user pools. Follow these instructions to manually set up the required resources in your AWS account.

---

## Step 1: Set Up DynamoDB Tables

1.  Log in to the [AWS DynamoDB console](https://console.aws.amazon.com/dynamodb/).
2.  Click **"Create table"**.
3.  For each table:

    - Enter the **Table Name** and **Primary Key** as specified below: -
      **Table Name:** `ChefsTable` - Partition Key: `Email` (String) 
      - Keep the Table settings as default
      - Items Schema example:
      {
      "Email": {
      "S": "elad@gmail.com"
      },
      "Category": {
      "S": "French Mexican Seafood"
      },
      "Date": {
      "S": "1736772811076"
      },
      "Description": {
      "S": "Gordon Ramsay is a world-renowned British chef, restaurateur, television personality, and author. Born on November 8, 1966, in Johnstone, Scotland, and raised in Stratford-upon-Avon, England, Ramsay is widely recognized for his fiery temperament, high standards, and culinary expertise."
      },
      "Gallery": {
      "L": [
      {
      "S": "https://chefs-images.s3.amazonaws.com/img/th.jpg"
      },
      {
      "S": "https://chefs-images.s3.amazonaws.com/img/food11.jpg"
      },
      {
      "S": "https://chefs-images.s3.amazonaws.com/img/food111.jpg"
      },
      {
      "S": "https://chefs-images.s3.amazonaws.com/img/food1111.jpg"
      },
      {
      "S": "https://chefs-images.s3.amazonaws.com/img/food11222.jpg"
      }
      ]
      },
      "Name": {
      "S": "Chef Gordon Ramsay"
      },
      "Price": {
      "N": "555"
      },
      "ProfilePic": {
      "S": "https://chefs-images.s3.amazonaws.com/img/Pprofile.jpg"
      }
      }

             - **Table Name:** `ChefRequestTable`
               - Partition Key: `Email` (String)
               - Keep the Table settings as default
               - Items Schema example:
               {

      "Email": {
      "S": "elad@gmail.com"
      },
      "NewGroup": {
      "S": "ChefUser"
      },
      "OldGroup": {
      "S": "SimpleUser"
      },
      "Status": {
      "S": "Approved"
      },
      "Timestamp": {
      "N": "1736771657"
      }
      }

4.  Click **Create table**.

---

## Step 2: Deploy Lambda Functions

1. Go to the [AWS Lambda console](https://console.aws.amazon.com/lambda/).
2. Click **"Create function"** → **Author from scratch**.
3. Configure the function:
   - **Function name:** Choose a name like `GetChefs`.
   - **Runtime:** Select the appropriate runtime Python 3.9.
   - **Execution role:**
     - Choose **"Create a new role with basic Lambda permissions"**.
   - Click **Create function**.
4. Upload the code:
   - Navigate to the **Code** tab.
   - Click **Upload from** → **.zip file**, and select the corresponding Lambda function zip file from the project folder.
   - Optional -- if you're having trouble uploading the zip you can also open the specific lambda and copy it's code into you lambda code.
   - Click **Deploy**.
5. Repeat for all Lambda functions in the project.

---

## Step 3: Set Up API Gateway

1. Open the [API Gateway console](https://console.aws.amazon.com/apigateway/).
2. Click Create API
3. Click "Import API".
4. Select REST API and choose "Choose a file".
5. Upload the exported API ZIP file provided in the project folder.
   Once the import completes:
6. Review the imported routes and ensure they align with the project requirements.
7. Verify that the routes are correctly integrated with their respective Lambda functions. (The Lambda names in the file correspond to their intended targets, but double-check if needed.)
8. Deploy the API:
   Click Deploy API, specify a stage name (e.g., dev or prod), and confirm the deployment.
9. Copy the API base URL provided in the stage settings for testing.

---

## Step 4: Set Up SNS Topics

1. Navigate to the [SNS console](https://console.aws.amazon.com/sns/).
2. Click **"Create topic"**.
3. Choose **Standard** .
4. Configure the topic:
   - **Name:** For example, `UserNotifications`.
5. Create subscriptions:
   - Click **Create subscription**.
   - Choose the protocol Email.
   - Enter the endpoint (Email adresss).
6. Test the setup:
   - Publish a test message to the topic to verify the subscription.

---

## Step 5: Set Up Cognito

1. Go to the [Cognito console](https://console.aws.amazon.com/cognito/).
2. Click **"Create user pool"**.
3. Configure the user pool:
   - **Pool name:** For example, `UserPool`.
   - Enable **email** as a sign-in option.
   - Configure password policies as needed.
4. Add an app client:
   - Go to the **App clients** section.
   - Click **Add an app client**, and provide a name (e.g., `WebAppClient`).

---

For any questions or issues, contact eladaharon065@gmail.com
