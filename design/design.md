# Objective

Design a minimal Etsy shop with the following features:
 - Storefront displaying all products on sale
 - Ability to buy products (no need to build payments integation for this exercise; just remove the item from the database when "bought")
 - Store admin can manually add more products

## 1. Core User Flows

In the below explanation, user refers to a non-admin customer.  
Critical assumption: The admin created the shop and already has an account, and the shop is already present in the database

User or admin logs in
- They type username, password into a form.
- On form submission, client sends request including username, hashed password (hash in client?)
- API server verifies this is valid by checking that this combination is in DB
- On success, JWT token and user is logged in
- On failure, error demonstrated to user

User or admin logs out
- Client side JWT cleared out of cookies.

Logged in user is browsing products:
- Client makes a GET request to the API server's /products:id endpoint (id is shop id)
- API server asks database for all products, and responds with list of products
- Client displays list of products
- User gets to look at a vast list of products, seeing their names, and prices

Logged in user buys a product:
- User clicks on a product and buys it.
- Client makes a DELETE request to the API server's /product:id endpoint.
- API server asks database to:
    - delete product from products, given the id
    - remove that id from the product list in the shops table as well.
- User gets to browse more products

Logged in admin adds a product:
- Admin clicks on a new product form. Enters product name, product price
- On form submission, client makes a POST request to the API server, which adds it to DB

Acknowledgement: if server is providing the shop, we assume it knows the shop id

## 2. Data models
List your tables and columns, with primary keys and any unique constraints or indexes you need for V1. Include 1–2 example rows where helpful.

products:  
product_id primarykey   
name string  
price number w/ 2 decimals  

[123456789, "Toy Car", "$3.99"]

shops: 
shop_id primarykey  
product_ids foreignkeys  
admin_id foreignkey (to users table)  

[123123123, [123456789, 2131243243243], 987654321]

users:  
user_id primarykey  
username string  
hashed_password string  
is_admin boolean  
[987654321, "administrator", sadfdsfjklasjfkl123ajf3ru32423edq, true]
[000000000, "customer", 897dfgq34n897tfasdjkewrq2, false]

## 3. Architecture Diagram

Attached.

## 4. API Sketch
List the minimal endpoints and their request/response shapes at a high level. Keep this terse. State what each returns on success and what errors matter in V1.

POST /signup
request: { username, password }
successful response: { jwt_token }
errors: {"error": "username taken"} if we already have that user

POST /login
request: { username, password }
successful response: { jwt_token }
errors: {"error": "wrong password"} if that's the case

GET /products:id (id is shop id) 
request: {}  
successful response: { products: [{product_id1, name1, price1}, {product_id2, name2, price2} ...]}  

POST /product  
request: { name: string, price: string }, JWT  
successful response: {}  
errors: if no JWT, {"error": "invalid token"} response with appropriate code

DELETE /product:id (product id)
request: {}  
successful response: {}  
errors: if the product has already been deleted should an {"error": "product <id> already deleted"} response with appropriate code.  