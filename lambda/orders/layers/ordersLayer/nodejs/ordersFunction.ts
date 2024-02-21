import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { OrderRepository } from "./orderRepository";
import { ProductsRepository } from "lambda/products/layers/productsLayer/nodejs/productsRepository";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CarrierType, Order, OrderProductResponse, OrderRequest, OrderResponse, PaymentType, ShippingType } from "./model/orderProductModel";
import { Product } from "model/products";

const orderDdb = process.env.ORDERS_DDB;
const productsDdb = process.env.PRODUCTS_DDB;
const ddbCliente = new DocumentClient();

const orderRepository = new OrderRepository(ddbCliente, orderDdb)
const productRepository = new ProductsRepository(ddbCliente, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{
    const method = {
        get: 'GET',
        post: 'POST',
        delete: 'DELETE'
    }

    if(method.get){
        if(event.queryStringParameters){
            const email = event.queryStringParameters?.email
            const orderId = event.queryStringParameters?.orderId
            if(email && orderId){
                try{

                    const order = await orderRepository.getOrder(email, orderId)
                    return {
                        statusCode: 200,
                        body: JSON.stringify(convertToOrderResponse(order))
                    }
                }catch(error){
                    return {
                        statusCode: 404,
                        body: (<Error>error).message
                    }
                }
            }else{
                const orders = await orderRepository.getOrdersByEmail(email)
                return {
                    statusCode: 200,
                    body: JSON.stringify(orders.map((order) => convertToOrderResponse(order)))
                
                }
            }
        }else{
            const orders = await orderRepository.getAllOrders()
            return {
                statusCode: 200,
                body: JSON.stringify(orders.map((order) => convertToOrderResponse(order)))
            
            }
        }
        
    }else{
        if(method.post){
            //POST AQUI
            const orderRequest: OrderRequest = JSON.parse(event.body!) as OrderRequest
            const products = await productRepository.getProductsByIds(orderRequest.productsIds)
            if(products.length === orderRequest.productsIds.length){
                const order = buildOrder(orderRequest, products)
                const orderCreated = await orderRepository.createOrder(order)
                return {
                    statusCode: 201,
                    body: JSON.stringify(convertToOrderResponse(orderCreated))
                }
            }else{
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        message: "Not Found"
                    })
                
                }
            }
        }else if(method.delete){
             const email = event.queryStringParameters?.email
            const orderId = event.queryStringParameters?.orderId
        }
    }
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request"
        })
    }
}

function convertToOrderResponse(order: Order): OrderResponse {
    const orderProducts: OrderProductResponse[] = []
    order.products.forEach((product) => {
        orderProducts.push({
            code: product.code,
            price: product.price
        })
    })
    const orderResponse: OrderResponse = {
        email: order.pk,
        id: order.sk!,
        createdAt: order.createAt!,
        products: orderProducts,
        billing: {
            payment: order.billing.payment as PaymentType,
            totalPrice: order.billing.totalPrice
        },
        shipping: {
            type: order.shipping.type as ShippingType,
            carrier: order.shipping.carrier as CarrierType
        }
    }

    return orderResponse

}

function buildOrder(orderRequest: OrderRequest, products: Product[]): Order {
    const orderProduct: OrderProductResponse[] = []
    let totalPrice = 0
    products.forEach((product) => {
        totalPrice += product.price
        orderProduct.push({
            code: product.code,
            price: product.price
        })
    })

    const order: Order = {
        pk: orderRequest.email,
        billing: {
            payment: orderRequest.payment,
            totalPrice: totalPrice
        },
        shipping: {
            type: orderRequest.shipping.type,
            carrier: orderRequest.shipping.carrier
        },
        products: orderProduct
    }
    return order
}