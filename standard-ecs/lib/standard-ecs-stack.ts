import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";


export class StandardEcsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpcStandardEcs", {
      maxAzs: 3
    });

    const cluster = new ecs.Cluster(this, "ecsStandardEcs", {
      vpc: vpc,
      clusterName: "Standard",
      enableFargateCapacityProviders: true
    });

    const fargateTask = new ecs.FargateTaskDefinition(this, "fargateTaskStandardEcs", {
      cpu: 512,
      memoryLimitMiB: 1024,
    });

    fargateTask.addContainer("fargateContainer", {
      image: ecs.ContainerImage.fromRegistry("wfong/loaded-node"),
      environment: {
        PORT: "80"
      },
      //portMappings: [{ containerPort: 3000 }]
    });

    const fargate = new ecs.FargateService(this, "fargateStandardEcs", {
      cluster: cluster,
      taskDefinition: fargateTask
    });

    /*
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "albStandardEcs", {
      cluster: cluster,
      cpu: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("wfong/loaded-node"),
        environment: {
          PORT: "80"
        },
      },
      memoryLimitMiB: 1024,
      publicLoadBalancer: true
    });
    */
  }
}
