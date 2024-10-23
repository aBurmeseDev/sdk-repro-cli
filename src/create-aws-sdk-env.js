#!/usr/bin/env node

const prompts = require('prompts');
const fs = require('fs');
const path = require('path');

const questions = [
  {
    type: 'text',
    name: 'projectName',
    message: 'Enter a name for your project:',
    validate: value => value !== '' ? true : 'Please enter a project name'
  },
  {
    type: 'select',
    name: 'environment',
    message: 'Select the environment type:',
    choices: [
      { title: 'Node', value: 'node' },
      { title: 'Browser', value: 'browser' },
      { title: 'React Native', value: 'react-native' }
    ],
    initial: 0
  },
  {
    type: 'confirm',
    name: 'includeExamples',
    message: 'Include AWS SDK examples?',
    initial: true
  }
];

(async () => {
  const answers = await prompts(questions);

  const projectDir = path.join(process.cwd(), answers.projectName);

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }

  const packageJson = {
    name: answers.projectName,
    version: '1.0.0',
    description: 'AWS SDK for JavaScript v3 project',
    main: 'index.js',
    dependencies: {
      '@aws-sdk/client-s3': 'latest'
    },
    scripts: {
      start: 'node index.js'
    }
  };

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  let indexJs = `const { S3Client } = require('@aws-sdk/client-s3');

const client = new S3Client({ region: 'us-east-1' });

// Add your AWS SDK v3 code here
`;

  if (answers.environment === 'browser') {
    indexJs = `<script>
import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({ region: 'us-east-1' });

// Add your AWS SDK v3 code here
</script>
`;
  } else if (answers.environment === 'react-native') {
    indexJs = `import { S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({ region: 'us-east-1' });

// Add your AWS SDK v3 code here
`;
  }

  fs.writeFileSync(path.join(projectDir, 'index.js'), indexJs);

  if (answers.includeExamples) {
    const examplesDir = path.join(projectDir, 'examples');
    fs.mkdirSync(examplesDir);

    const listBucketsExample = `const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({ region: 'us-east-1' });

const listBuckets = async () => {
  try {
    const data = await client.send(new ListBucketsCommand({}));
    console.log('Success', data.Buckets);
  } catch (err) {
    console.log('Error', err);
  }
};

listBuckets();
`;

    fs.writeFileSync(path.join(examplesDir, 'list-buckets.js'), listBucketsExample);
  }

  console.log(`Project "${answers.projectName}" has been created successfully!`);
  console.log('To run the project, navigate to the project directory and run:');
  console.log(`  cd ${answers.projectName}`);

  if (answers.environment === 'node') {
    console.log('  npm install');
    console.log('  npm start');
  } else if (answers.environment === 'browser') {
    console.log('  Open index.js in a web browser');
  } else if (answers.environment === 'react-native') {
    console.log('  Follow the React Native setup instructions to run the project');
  }
})();