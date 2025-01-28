import json
import boto3
from decimal import Decimal

# Create DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefsTable')  # Replace with your table name

# Helper function to handle Decimal serialization
def decimal_to_json(obj):
    if isinstance(obj, list):
        return [decimal_to_json(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: decimal_to_json(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    else:
        return obj

def lambda_handler(event, context):
    try:
        # Scan the DynamoDB table
        response = table.scan()
        items = response.get('Items', [])

        # Convert items to JSON-compatible format
        serialized_items = decimal_to_json(items)

        return {
            'statusCode': 200,
            'body': json.dumps(serialized_items)  # Return the items as JSON
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})  # Return the error message
        }
