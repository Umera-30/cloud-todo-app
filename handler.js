const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const TABLE = "TodoTable";

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;

  if (method === "GET" && path === "/todos") {
    const data = await db.scan({ TableName: TABLE }).promise();
    return response(200, data.Items);
  }

  if (method === "POST" && path === "/todos") {
    const body = JSON.parse(event.body);
    const id = Date.now().toString();

    const item = { id, text: body.text };
    await db.put({ TableName: TABLE, Item: item }).promise();
    return response(200, item);
  }

  if (method === "DELETE" && path.startsWith("/todos/")) {
    const id = path.split("/")[2];
    await db.delete({ TableName: TABLE, Key: { id } }).promise();
    return response(200, { message: "Deleted" });
  }

  return response(404, { error: "Not found" });
};

function response(status, body) {
  return {
    statusCode: status,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body),
  };
}
