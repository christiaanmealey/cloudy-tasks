import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("AWS credentials are missing. Check your environment variables.");
}

const client = new DynamoDBClient({
    region: 'us-east-2',
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;