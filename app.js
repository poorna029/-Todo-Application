const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
let db = null;
const { open } = require("sqlite");
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");

const initializeDBandServer = () => {
  try {
    app.listen(3000, async () => {
      console.log("server running at http://localhost:3000");
      db = await open({ filename: dbpath, driver: sqlite3.Database });
    });
  } catch (e) {
    console.log(`DBerror ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();
// -------------------------------------------->>> 1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  console.log(status, priority, search_q);
  const sqlQ = `select * from todo where 
 (status like "%${status}%" and priority like "%${priority}%" and todo like "%${search_q}%");`;
  const lis = await db.all(sqlQ);
  response.send(lis);
});

// >----------------------------------->>> 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqQ = `select * from todo where id =${todoId};`;
  const list1 = await db.get(sqQ);
  response.send(list1);
});

// >------------------------------------>>> 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(id, todo, priority, status);
  const insertQry = `insert into todo (id,todo,priority,status) values
  (${id},"${todo}","${priority}","${status}");`;
  const rt = await db.run(insertQry);
  response.send("Todo Successfully Added");
});

// >------------------------------------->>> 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const prevalsQry = `select * from todo where id=${todoId};`;
  const prevals = await db.get(prevalsQry);
  const requestBody = request.body;
  console.log(prevals.status, prevals.priority, prevals.todo);
  const {
    status = prevals.status,
    todo = prevals.todo,
    priority = prevals.priority,
  } = requestBody;
  let UpdateStatus = "";

  console.log(status, todo, priority);
  switch (true) {
    case requestBody.status !== undefined:
      UpdateStatus = "Status";
      break;
    case requestBody.priority !== undefined:
      UpdateStatus = "Priority";
      break;
    case requestBody.todo !== undefined:
      UpdateStatus = "Todo";
      break;
  }

  //   if (requestBody.status !== undefined) {
  //     UpdateStatus = "Status";
  //   } else if (requestBody.priority !== undefined) {
  //     UpdateStatus = "Priority";
  //   } else if (requestBody.todo !== undefined) {
  //     UpdateStatus = "Todo";
  //   }
  const updateQry = `update todo set status ="${status}" ,
    priority = "${priority}",todo ="${todo}" where id =${todoId};`;
  await db.run(updateQry);

  response.send(`${UpdateStatus} Updated`);
});

// -------------------------------------->>> 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `delete from todo where id=${todoId};`;
  await db.run(sqlQuery);
  response.send("Todo Deleted");
});
