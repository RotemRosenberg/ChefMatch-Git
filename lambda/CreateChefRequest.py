import boto3
import time

# התחברות לטבלה
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefRequestTable')  # שם הטבלה שלך

def lambda_handler(event, context):
    try:
        # נתונים מהבקשה
        email = event['email']
        old_group = event['oldGroup']
        new_group = event['newGroup']

        # בדיקה אם הבקשה כבר קיימת
        response = table.get_item(Key={'Email': email})
        if 'Item' in response:
            return {
                'statusCode': 400,
                'body': f'Request already exists for email: {email}'
            }

        # הוספת הבקשה לטבלה
        table.put_item(
            Item={
                'Email': email,
                'OldGroup': old_group,
                'NewGroup': new_group,
                'Status': 'Pending',
                'Timestamp': int(time.time())
            }
        )
        return {
            'statusCode': 200,
            'body': f'Request created successfully for email: {email}'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
