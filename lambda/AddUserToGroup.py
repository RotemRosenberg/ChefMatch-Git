import boto3
import json

def lambda_handler(event, context):
    # פרטים מתוך האירוע
    user_pool_id = event['userPoolId']
    user_name = event['userName']
    group_name = "SimpleUser"  # שם הקבוצה שאליה המשתמש יצורף

    # יצירת לקוח Cognito
    client = boto3.client('cognito-idp')

    try:
        # הוספת המשתמש לקבוצה
        client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=user_name,
            GroupName=group_name
        )
        print(f"User {user_name} added to group {group_name}.")
    except Exception as e:
        print(f"Error adding user {user_name} to group {group_name}: {str(e)}")

    # מחזיר את האירוע כתגובה
    return event
