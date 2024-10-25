# sdk-repro-cli

**sdk-repro-cli** is a command-line interface (CLI) tool that helps you create a reproducible environment for working with the AWS SDK for JavaScript v3. It allows you to set up a project with the desired AWS service, operation, and environment (Node.js, Browser, or React Native), including the necessary dependencies and LLM generated example code.


## Pre-requisites

- Have AWS credentials configured on your machine (or you may enter your credentials as an extra step during process)

## Steps to test:

- Fork this repo, and clone your fork.
- Install dependencies `cd sdk-repro-cli/ && npm install`
- Change directory into src and run the script file `cd src/ && ./create-aws-sdk-env.js`
- Follow the prompts and provide required information
```console
? Enter a name for your project: my-s3-project
? Select the environment type: Node
? Select the AWS service you want to work with: S3
? Enter the service operation you want an example for: ListBuckets
? Enter the AWS region (leave blank for us-west-1): us-east-1
? Include AWS SDK examples? Yes
Project "my-s3-project" has been created successfully!
To run the project, navigate to the project directory and run:
  cd my-s3-project
  npm install
  npm start
```
- Depends on service operation you choose, you may need to edit `index.js` file to add client input params before `npm start`. (Extra step: add your AWS credentials to `index.js`)
- However, for simple operation like S3 ListBuckets, you can run `npm start` straight away since minimal code example is already scripted.

## Recording of an Example 
![sdk-repro-cli](https://github.com/user-attachments/assets/2716fdef-7deb-4361-b07e-5dd765c8e26f)



## LICENSE

This library is licensed under the MIT License. See the LICENSE file.
