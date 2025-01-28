import boto3
import json

# התחברות ל-DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefRequestTable')  # שם הטבלה שלך

def lambda_handler(event, context):
    try:
        
        email = event['email']  # מייל של המשתמש
        
        if not email:
            return {
                'statusCode': 400,
                'body': "Error: Missing 'email' in the request body"
            }

        # שליפת השורה מהטבלה
        response = table.get_item(Key={'Email': email})
        if 'Item' not in response:
            return {
                'statusCode': 200,
                'body': '0'  # אין בקשה מתאימה
            }

        # בדיקת הסטטוס
        item = response['Item']
        status = item.get('Status', '')

        if status == 'Pending':
            return {
                'statusCode': 200,
                'body': '1'  # בקשה ממתינה
            }
        elif status == 'Rejected':
            return {
                'statusCode': 200,
                'body': '2'  # בקשה נדחתה
            }
        else:
            return {
                'statusCode': 200,
                'body': '0'  # אין בקשה מתאימה
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f"Error: {str(e)}"
        }
