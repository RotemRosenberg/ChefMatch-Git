import json
import boto3
import os

sns_client = boto3.client('sns')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', 'arn:aws:sns:us-east-1:776565580225:ChefNotifications')

def lambda_handler(event, context):
    try:
        print("Incoming Event:", event)
        body = json.loads(event['body'])
        print("Parsed Body:", body)

        chef_email = body.get('chefEmail')
        user_name = body.get('userName')
        message = body.get('message')
        date = body.get('date')

        if not all([chef_email, user_name, message, date]):
            print("Missing required fields in the payload.")
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Missing required fields"})
            }

        email_message = (
            f"Hello,\n\n"
            f"You have received a new message from {user_name}.\n\n"
            f"Message: {message}\n"
            f"Date: {date}\n\n"
            f"Regards,\nYour System"
        )

        sns_response = sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=email_message,
            Subject="New Message from Your Website",
            MessageAttributes={
                'chefEmail': {
                    'DataType': 'String',
                    'StringValue': chef_email
                }
            }
        )

        print("SNS Publish Response:", sns_response)

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Email sent successfully!"})
        }

    except Exception as e:
        print("Error occurred:", e)
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to send email", "error": str(e)})
        }
