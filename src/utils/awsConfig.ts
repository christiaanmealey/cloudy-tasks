import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fromEnv } from "@aws-sdk/credential-providers";

const REGION = "us-east-2"; // Change to your region

const client = new DynamoDBClient({
  region: REGION,
  credentials: fromEnv()
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;