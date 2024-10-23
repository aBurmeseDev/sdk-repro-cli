const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({ region: 'us-west-2' });

const listBuckets = async () => {
  try {
    const data = await client.send(new ListBucketsCommand({}));
    console.log('Success', data.Buckets);
  } catch (err) {
    console.log('Error', err);
  }
};

listBuckets();
console.log(data)
