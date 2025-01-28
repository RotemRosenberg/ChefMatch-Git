import boto3

# התחברות ל-DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefRequestTable')  # שם הטבלה שלך

def lambda_handler(event, context):
    try:
        # שליפת כל הפריטים מהטבלה
        response = table.scan()
        
        # החזרת הבקשות
        return {
            'statusCode': 200,
            'body': response['Items']
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f"Error: {str(e)}"
        }
