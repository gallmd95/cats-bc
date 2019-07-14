#curl -H "Content-Type: application/json" -X POST -d '{"breed":"Maine Coon", "imageUrl":"http://google.com", "name": "Lis", "password":"12342134", "username":"Fred", "weight": 2.1}' http://localhost:3000/cat/register
#curl -H "Content-Type: application/json" -X POST -d '{"password":"12342134", "username":"Fred"}' http://localhost:3000/cat/login
curl -H "Content-Type: application/json" -H "auth-token: e567dbea5b08bbdf1e46fa87081acfda0876450f36d0672720d437b790b27349" -X POST -d '{"id": "12"}' http://localhost:3000/cats
#curl -X POST  http://localhost:3000/cats/random