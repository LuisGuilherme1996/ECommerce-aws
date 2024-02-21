import { DocumentClient } from "aws-sdk/clients/dynamodb";
import {v4 as uuidv4} from 'uuid'
import { Order } from "./model/orderProductModel";

export class OrderRepository {
    private ddbCliente: DocumentClient
    private ordersDdb: string
    constructor(ddbCliente: DocumentClient, ordersDdb: string){
        this.ddbCliente = ddbCliente
        this.ordersDdb = ordersDdb
    }

    async createOrder(order: Order): Promise<Order>{
        order.sk = uuidv4()
        order.createAt = Date.now()
         await this.ddbCliente.put({
            TableName: this.ordersDdb,
            Item: order
        }).promise()
        return order
    }

    async getAllOrders(): Promise<Order[]>{
        const orders = await this.ddbCliente.scan({
            TableName: this.ordersDdb
        }).promise()
        return orders.Items as Order[]
    }

    async getOrdersByEmail(email: string): Promise<Order[]>{
        const orders = await this.ddbCliente.query({
            TableName: this.ordersDdb,
            KeyConditionExpression: "pk = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
        }).promise()
        return orders.Items as Order[]
    }

    async getOrder(email: string, id: string): Promise<Order>{
        const order = await this.ddbCliente.get({
            TableName: this.ordersDdb,
            Key: {
                pk: email,
                sk: id
            }
        }).promise()
        if(!order.Item){
            throw new Error("Order not found")
        }else {
            return order.Item as Order
        }
    }
    
    async deleteOrder(email: string, orderId: string): Promise<Order>{
       const data =  await this.ddbCliente.delete({
            TableName: this.ordersDdb,
            Key: {
                pk: email,
                sk: orderId
            },
            ReturnValues: "ALL_OLD"
        }).promise()
        if(!data.Attributes){
            throw new Error("Order not found")
        }else{
            return data.Attributes as Order
        }
    }
}