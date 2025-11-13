const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const discountPackageDef = protoLoader.loadSync(path.join(__dirname, '../../proto/discount.proto'));
const discountProto = grpc.loadPackageDefinition(discountPackageDef).discount;
const app = express();

// Serve o frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const discountClient = new discountProto.DiscountService(
  'localhost:3003',
  grpc.credentials.createInsecure()
);

app.use(cors());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

app.get('/product/:id', (req, res, next) => {
    // Chama método do microsserviço.
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
        // Se ocorrer algum erro de comunicação
        // com o microsserviço, retorna para o navegador.
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            // Caso contrário, retorna resultado do
            // microsserviço (um arquivo JSON) com os dados
            // do produto pesquisado
            res.json(product);
        }
    });
});

app.get('/discount/:price/:percent', (req, res) => {
  const { price, percent } = req.params;

  discountClient.CalculateDiscount(
    { price: parseFloat(price), percent: parseFloat(percent) },
    (err, response) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'something failed :(' });
      } else {
        res.json(response);
      }
    }
  );
});

// Rota padrão (para index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
