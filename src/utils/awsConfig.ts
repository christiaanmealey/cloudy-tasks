import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const REGION = "us-east-2"; 
const IDENTITY_POOL_ID = "us-east-2:9efe3453-d876-4532-aeb6-80a83dd12072"

const client = new DynamoDBClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    identityPoolId: IDENTITY_POOL_ID,
    clientConfig: { region: REGION }
  }),
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;