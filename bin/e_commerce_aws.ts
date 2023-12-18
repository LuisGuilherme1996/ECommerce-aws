#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductStack } from 'aws-cdk-lib/aws-servicecatalog';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();
  const env: cdk.Environment =  {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }

  const tags = {
    cost: "ECommerce",
    team: "LuisGuilherme"
  }
  const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
    tags: tags,
    env: env
  })
const ecommerceApi =   new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags: tags,
  env: env
})

ecommerceApi.addDependency(productsAppStack)