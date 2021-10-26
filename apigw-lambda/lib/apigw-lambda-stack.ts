import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cognito from '@aws-cdk/aws-cognito';


export class ApigwLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ]
    });

    const handler = new lambda.Function(this, 'LambdaNodeStack', {
      code: lambda.Code.fromAsset('./src'),
      functionName: "echoService",
      handler: 'index.handler',
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_14_X,
      vpc: vpc,
      vpcSubnets:
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
    });

    const apigateway = new apigw.LambdaRestApi(this, "api", {
      handler: handler
    });

    const userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: 'my-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        isAdmin: new cognito.StringAttribute({mutable: true}),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}