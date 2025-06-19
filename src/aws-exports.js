// src/aws-exports.js

const awsmobile = {
    "aws_project_region": "us-east-1", // e.g., "us-east-1"
    "aws_cognito_region": "us-east-1", // Same as above
    "aws_user_pools_id": "us-east-1_2HAUbEwI8", // From parent-stack.yaml output
    "aws_user_pools_web_client_id": "ohvu7loq0okpm0sqn9jl7p650", // From parent-stack.yaml output
    "aws_cloud_logic_custom": [
        {
            "name": "ArchiverApi", // This name should match the name used in Amplify API calls
            "endpoint": "https://qgpfx91ang.execute-api.us-east-1.amazonaws.com/v1", // From parent-stack.yaml output (e.g., https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/v1)
            "region": "us-east-1" // Same as above
        }
    ]
};

export default awsmobile;