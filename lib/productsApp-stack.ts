import { Stack, StackProps, aws_s3 as s3 } from 'aws-cdk-lib'; // common package for stable construct
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNodeJS from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";

export class ProductsAppStack extends cdk.Stack implements Construct{
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsFetchHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "ProductsFetchHandler",
      entry: "../lambda/products/productsFetchFunction.ts",
      handler: "handler",
      memorySize: 128,
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false
      }
    });
  }

}
