import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
export interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: NodejsFunction,
    productsAdminHandler: NodejsFunction,
    ordersHandler: NodejsFunction,
}

export interface ProductsAppStackProps extends cdk.StackProps {
    eventsDdb: dynamodb.Table
}

export interface OrdersAppStackProps extends cdk.StackProps {
    productsDdb: dynamodb.Table,
}

