const express = require("express"),
ejs =require("ejs"),
paypal = require("paypal-rest-sdk")

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AVhLlZxbRBh_-qpC73IQrS3lqzTylRSsTwEbdi3N_4Sqojj5H7Am4d9J1q8iOun8VUZq3ev8PejhxuIE',
    'client_secret': 'EN1tYC2c3_1LT_UfDcW6AgqpZSn-77noX8grap_uXaCWyNeEA0rBK8cuWwPEfzj0db6uaCV3-XlJDAPz'
  });

const app = express()

app.set("view engine", "ejs")

//INDEX Route
app.get("/", (req,res)=>{
    res.render("index")
})

//POST route
app.post("/pay", (req,res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cencel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "visa card",
                    "sku": "0001",
                    "price": "110.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "110.00"
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
               if (payment.links[i].rel === "approval_url") {
                   res.redirect(payment.links[i].href)
               }
                
            }
        }
    });
})

//SUCCES  Route
app.get("/success", (req,res)=>{
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "110.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            // console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send("success")
        }
    });
})

//CANCEL ROute
app.get("/cancel", (req, res)=>{
    res.send("canceled")
})

 app.listen(3000, ()=>{
     console.log("listening to port 3000")
 })