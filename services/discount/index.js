const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/discount.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const discountProto = grpc.loadPackageDefinition(packageDef).discount; // <- pacote "discount"

const server = new grpc.Server();

server.addService(discountProto.DiscountService.service, { // <- serviço "DiscountService"
  CalculateDiscount: (call, callback) => {
    const { price, percent } = call.request;
    const discountedPrice = price - (price * percent / 100);
    callback(null, { discountedPrice });
  }
});

server.bindAsync('0.0.0.0:3003', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Discount Service running at http://127.0.0.1:3003');
  server.start();
});
