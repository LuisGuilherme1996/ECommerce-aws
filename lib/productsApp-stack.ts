import {Construct} from "constructs";
 import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "@aws-cdk/aws-lambda-nodejs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';

export class ProductsAppStack extends cdk.Stack{
    readonly productsFetchHandler: NodejsFunction
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.productsFetchHandler = new NodejsFunction(this, "ProductsFetchHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: "ProductsFetchHandler",
      entry: 'lambda/products/productsFetchFunction.ts',
      handler: "handler",
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false
      }
    });
  }
}
