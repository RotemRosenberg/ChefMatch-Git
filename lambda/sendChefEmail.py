import boto3
import json
from boto3.dynamodb.conditions import Attr
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table_name = "ChefsTable"
table = dynamodb.Table(table_name)

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
        # Log the incoming event for debugging
        print("Received event:", json.dumps(event))

        # Extract query parameters
        query_params = event.get("queryStringParameters", {})
        search_type = query_params.get("type")
        search_value = query_params.get("value")

        # Validate query parameters
        if not search_type or not search_value:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required query parameters: type or value"}),
                "headers": {"Content-Type": "application/json"},
            }

        # Transform search value to lowercase for case-insensitive comparison
        search_value_lower = search_value.lower()

        # Scan the table and filter results manually
        response = table.scan()
        items = response.get("Items", [])

        # Filter items manually for full word match
        filtered_items = []
        for item in items:
            if search_type == "Category" and "Category" in item:
                # Check if search_value is a whole word in the Category field
                category_words = [word.strip().lower() for word in item["Category"].split(",")]
                if any(search_value_lower == word for word in category_words):
                    filtered_items.append(item)
            elif search_type == "Name" and "Name" in item:
                if search_value_lower in item["Name"].lower():
                    filtered_items.append(item)
            elif search_type == "Price" and "Price" in item:
                try:
                    if float(item["Price"]) == float(search_value):
                        filtered_items.append(item)
                except ValueError:
                    continue

        # Serialize the filtered items to JSON-compatible format
        serialized_items = decimal_to_json(filtered_items)

        # Return the serialized items as a JSON string
        return {
            "statusCode": 200,
            "body": json.dumps(serialized_items),
            "headers": {"Content-Type": "application/json"},
        }

    except Exception as e:
        # Log the error for debugging
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"},
        }
