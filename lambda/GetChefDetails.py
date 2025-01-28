import boto3
import json
from decimal import Decimal

# Connect to DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefsTable')  # Replace with your DynamoDB table name

# Function to convert Decimal to standard Python data types
def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, list):
        return [decimal_to_float(i) for i in obj]
    if isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    return obj

def lambda_handler(event, context):
    try:
        # Retrieve email from query parameters
        query_params = event.get('queryStringParameters', {})
        email = query_params.get('email')

        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({"message": "Error: Missing 'email' query parameter"})
            }

        # Retrieve the item from DynamoDB
        response = table.get_item(Key={'Email': email})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({"message": "No chef found for the provided email"})
            }

        # Convert Decimal values to standard Python data types
        item = decimal_to_float(response['Item'])

        # Return the item found
        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"message": "Internal server error", "error": str(e)})
        }
