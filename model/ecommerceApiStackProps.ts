import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
export interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: NodejsFunction,
    productsAdminHandler: NodejsFunction
}

