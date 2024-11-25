import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';

export class RdsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbCredentialsSecret = new secretsmanager.Secret(this, 'MyDBCreds', {
      secretName: process.env.SECRET_NAME,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: process.env.DB_USERNAME,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });

    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 2, // Default is all AZs in the region
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const dbInstance = new rds.DatabaseInstance(this, 'RDSInstance', {
      // MySQL
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0
      }),

      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false
    });

    const rdsLambdaFunction = new lambdaNodejs.NodejsFunction(this, 'RdsLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join('..', '..', 'nodejs-aws-cart-api', 'dist', 'main.js'),
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk', '@nestjs/microservices', 'class-transformer', '@nestjs/websockets/socket-module', 'cache-manager', 'class-validator'], // Exclude non-runtime dependencies
      },
      vpc, // Associate the Lambda function with the VPC
      allowPublicSubnet: true, // Confirm that lambda is in VPC
      securityGroups: [dbInstance.connections.securityGroups[0]]
    })

    dbInstance.connections.allowDefaultPortFrom(rdsLambdaFunction);

    dbCredentialsSecret.grantRead(rdsLambdaFunction);

    const api = new apigateway.RestApi(this, 'NestApi', {
      restApiName: 'Nest Service',
      description: 'This service serves a Nest.js application.',
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(rdsLambdaFunction);


    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'RdsInfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
