#!/usr/bin/env node

const {
	BedrockRuntimeClient,
	ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const prompts = require("prompts");
const fs = require("fs");
const path = require("path");

const awsServices = [
	{ title: "S3", value: "@aws-sdk/client-s3" },
	{ title: "DynamoDB", value: "@aws-sdk/client-dynamodb" },
	{ title: "EC2", value: "@aws-sdk/client-ec2" },
	{ title: "IAM", value: "@aws-sdk/client-iam" },
	{ title: "Lambda", value: "@aws-sdk/client-lambda" },
	// Add more services here
];

const questions = [
	{
		type: "text",
		name: "projectName",
		message: "Enter a name for your project:",
		validate: (value) => (value !== "" ? true : "Please enter a project name"),
		initial: `sdk-repro${Date.now()}`,
	},
	{
		type: "select",
		name: "environment",
		message: "Select the environment type:",
		choices: [
			{ title: "Node", value: "node" },
			{ title: "Browser", value: "browser" },
			{ title: "React Native", value: "react-native" },
		],
		initial: 0,
	},
	{
		type: "select",
		name: "service",
		message: "Select the AWS service you want to work with:",
		choices: awsServices,
		initial: 0,
	},
	{
		type: "text",
		name: "operation",
		message: "Enter the service operation you want an example for:",
		validate: (value) =>
			value !== "" ? true : "Please enter a service operation",
		initial: "Example: ListBuckets",
	},
	{
		type: "text",
		name: "region",
		message: "Enter the AWS region (leave blank for us-west-1):",
		initial: "us-west-1",
	},
	{
		type: "confirm",
		name: "includeExamples",
		message: "Include AWS SDK examples?",
		initial: true,
	},
];

const client = new BedrockRuntimeClient({
	region: "us-west-2",
});

async function getExampleCode(service, operation) {
	const knowledgeBase =
		"You are a software developer with expertise in developing AWS SDK";
	const retrievalQuery = `write an example of JavaScript SDK v3 code for the ${service} service and ${operation} operation and only return javascript code, nothing else.`;
	const input = {
		modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
		contentType: "application/json",
		messages: [
			{
				role: "user",
				content: [
					{
						text: retrievalQuery,
					},
				],
			},
		],
		system: [{ text: knowledgeBase }],
	};

	const command = new ConverseCommand(input);

	try {
		const response = await client.send(command);
		if (response.output.message.content) {
			return response.output.message.content[0].text;
		} else {
			console.error("No example code found in the response");
			return null;
		}
	} catch (error) {
		console.error("Error fetching example code:", error);
		return null;
	}
}

(async () => {
	const answers = await prompts(questions);

	const projectDir = path.join(process.cwd(), answers.projectName);

	if (!fs.existsSync(projectDir)) {
		fs.mkdirSync(projectDir);
	}

	const selectedService = awsServices.find(
		(service) => service.value === answers.service
	);
	const serviceClient = `${selectedService.title}Client`;

	let indexJs;
	const operationName = answers.operation
		.replace(/([a-z])([A-Z])/g, "$1$2")
		.toLowerCase();
	const defaultExampleCode = `import { ${serviceClient}, ${answers.operation}Command } from '${answers.service}';
const client = new ${serviceClient}({
  region: '${answers.region}',
//  credentials: { // replace with AWS credentials
    // accessKeyId: '', 
    // secretAccessKey: '',
//  },
});
const input = { // ${answers.operation}Input

};
const command = new ${answers.operation}Command(input); // check SDK docs for command name casing
const response = await client.send(command);
console.log(response);
`;

	if (answers.environment === "node") {
		indexJs = defaultExampleCode;
		const packageJson = {
			name: answers.projectName,
			version: "1.0.0",
			description: `AWS SDK for JavaScript v3 project for ${answers.service}`,
			main: "index.js",
			type: "module",
			dependencies: {
				[answers.service]: "latest",
			},
			scripts: {
				start: "node index.js",
			},
		};
		fs.writeFileSync(
			path.join(projectDir, "package.json"),
			JSON.stringify(packageJson, null, 2)
		);
	} else if (answers.environment === "browser") {
		indexJs = `import { ${serviceClient}, ${answers.operation}Command } from '${answers.service}';

const getHTMLElement = (title, content) => {
const element = document.createElement("div");
element.style.margin = "30px";

const titleDiv = document.createElement("div");
titleDiv.innerHTML = title;
const contentDiv = document.createElement("textarea");
contentDiv.rows = 20;
contentDiv.cols = 50;
contentDiv.innerHTML = content;

element.appendChild(titleDiv);
element.appendChild(contentDiv);

return element;
};

const component = async () => {
const client = new ${serviceClient}({
  region: '${answers.region}',
  credentials: { // replace with AWS credentials
    // accessKeyId: '', 
    // secretAccessKey: '',
  },
});
const input = { // ${answers.operation}Input

};
const command = new ${answers.operation}Command(input); // check SDK docs for command name casing
const response = await client.send(command);
console.log(response);

return getHTMLElement(
  "Data returned by v3:",
  JSON.stringify(response, null, 2)
);
};

(async () => {
document.body.appendChild(await component());
})();`;

		const packageJson = {
			name: answers.projectName,
			version: "1.0.0",
			description: `AWS SDK for JavaScript v3 project for ${answers.service}`,
			private: true,
			main: "index.js",
			scripts: {
				start: "vite --open",
			},
			devDependencies: {
				vite: "latest",
			},
			dependencies: {
				[answers.service]: "latest",
			},
		};
		fs.writeFileSync(
			path.join(projectDir, "package.json"),
			JSON.stringify(packageJson, null, 2)
		);
	} else if (answers.environment === "react-native") {
		indexJs = defaultExampleCode;
	}
	fs.writeFileSync(path.join(projectDir, "index.js"), indexJs);

	if (answers.includeExamples) {
		const examplesDir = path.join(projectDir, "examples");
		fs.mkdirSync(examplesDir);

		// Fetch example code from Bedrock ConverseCommand
		const exampleCode = await getExampleCode(
			answers.service.split("-").pop(),
			answers.operation
		);

		if (exampleCode) {
			const exampleFileName = `${answers.service.split("-").pop()}${
				answers.operation
			}-example.js`;
			const fileContent = `// This example is generated by AWS Bedrock Claude3.5\n\n${exampleCode}`;
			fs.writeFileSync(path.join(examplesDir, exampleFileName), fileContent);
			console.log(
				`Example code for ${answers.service} ${answers.operation} has been written to ${exampleFileName}`
			);
		} else {
			console.log(
				`No example code found for ${answers.service} ${answers.operation}`
			);
			const exampleFileName = `${answers.service.split("/").pop()}-${
				answers.operation
			}-example.js`;
			fs.writeFileSync(
				path.join(examplesDir, exampleFileName),
				defaultExampleCode
			);
			console.log(
				`Default example code for ${answers.service} ${answers.operation} has been written to ${exampleFileName}`
			);
		}
	}

	console.log(
		`Project "${answers.projectName}" has been created successfully!`
	);
	console.log("To run the project, navigate to the project directory and run:");
	console.log(`  cd ${answers.projectName}`);

	if (answers.environment === "node") {
		console.log("  npm install");
		console.log("  npm start");
	} else if (answers.environment === "browser") {
		console.log("  npm install");
		console.log("  npm run start");
	} else if (answers.environment === "react-native") {
		console.log(
			"  Follow the React Native setup instructions to run the project"
		);
	}
})();
