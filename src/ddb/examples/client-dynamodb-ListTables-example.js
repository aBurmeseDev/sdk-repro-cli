import { dynamodb, ListTablesCommand } from '@aws-sdk/client-dynamodb';
const client = new dynamodb({ region: 'us-west-1' });
const input = { // ListTablesInput

};
const command = new ListTablesCommand(input);
const response = await client.send(command);
