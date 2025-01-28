import boto3

# התחברות לשירותים של AWS
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChefRequestTable')  # שם הטבלה שלך
cognito_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    try:
        # נתוני הבקשה
        email = event['email']  # מייל של המשתמש
        status = event['status']  # 'Approved' או 'Rejected'
        user_pool_id = 'us-east-1_yuC0jnKMw'  # מזהה ה-User Pool שלך
        new_group = 'ChefUser'  # שם הקבוצה החדשה

        # שליפת הבקשה מהטבלה
        response = table.get_item(Key={'Email': email})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': f'Request not found for email: {email}'
            }

        # עדכון הסטטוס בטבלה
        table.update_item(
            Key={'Email': email},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={'#status': 'Status'},
            ExpressionAttributeValues={':status': status}
        )

        # אם הבקשה אושרה, עדכן את הקבוצה של המשתמש בקוגניטו
        if status == 'Approved':
            try:
                # הסר את המשתמש מהקבוצה הישנה (SimpleUser)
                cognito_client.admin_remove_user_from_group(
                    UserPoolId=user_pool_id,
                    Username=email,
                    GroupName='SimpleUser'  # שם הקבוצה הישנה
                )
            except cognito_client.exceptions.ClientError as e:
                print(f"User not in SimpleUser group: {str(e)}")

            # הוסף את המשתמש לקבוצה החדשה (ChefUser)
            cognito_client.admin_add_user_to_group(
                UserPoolId=user_pool_id,
                Username=email,
                GroupName=new_group
            )

        return {
            'statusCode': 200,
            'body': f"Request for email {email} updated to {status}."
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f"Error: {str(e)}"
        }