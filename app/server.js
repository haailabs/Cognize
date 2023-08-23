const path = require("path");
const Koa = require("koa");
const serve = require("koa-static");
const Router = require("@koa/router");
const multer = require("@koa/multer");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const { MongoClient, ServerApiVersion } = require("mongodb");
// Replace your MongoDB URI Here
const uri =
  "mongodb+srv://cognize:cognize@cluster0.dd970o1.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;
client.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database.");
  } else {
    console.log("Connected to MongoDB Atlas.");
    database = client.db("cognize");
  }
});

const app = new Koa();
app.use(bodyParser());

app.use(serve(path.join(__dirname, "./")));

const router = new Router();

const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, "/uploads");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/HIP", async (ctx) => {
  let data = ctx.request.body;
  console.log(data);

  try {
    const collection = database.collection("tasks");
    await collection.insertOne(data);
    ctx.body = "Data received successfully!";
    console.log("Data written to MongoDB");
  } catch (error) {
    console.error("Error writing data to MongoDB:", error);
    ctx.status = 500;
    ctx.body = "Error writing data to MongoDB";
  }
});

router.delete("/HIP/:id", async (ctx) => {
  const id = ctx.params.id;
  console.log(`Deleting record with id: ${id}`);

  try {
    const collection = database.collection("tasks");
    const result = await collection.deleteOne({ id: parseInt(id) });

    if (result.deletedCount > 0) {
      ctx.body = "Record deleted successfully!";
      console.log("Record deleted from MongoDB");
    } else {
      ctx.status = 404;
      ctx.body = "Record not found";
      console.log("Record not found in MongoDB");
    }
  } catch (error) {
    console.error("Error deleting data from MongoDB:", error);
    ctx.status = 500;
    ctx.body = "Error deleting data from MongoDB";
  }
});

router.post("/REVIEW", async (ctx) => {
  const data = ctx.request.body;
  console.log(data);

  try {
    const collection = database.collection("responses");
    await collection.insertOne(data);
    ctx.body = "Data received successfully!";
    console.log("Data written to MongoDB");
  } catch (error) {
    console.error("Error writing data to MongoDB:", error);
    ctx.status = 500;
    ctx.body = "Error writing data to MongoDB";
  }
});

//Deleting a response
router.delete("/REVIEW/:id/:respondent", async (ctx) => {
  const id = ctx.params.id;
  const respondent = ctx.params.respondent;
  console.log(`Deleting review with taskId: ${id}, respondent: ${respondent}`);

  try {
    const collection = database.collection("responses");
    const result = await collection.deleteOne({
      taskId: parseInt(id),
      respondent: respondent
    });

    if (result.deletedCount > 0) {
      ctx.body = "Response deleted successfully!";
      console.log("Response deleted from MongoDB");
    } else {
      ctx.status = 404;
      ctx.body = "Response not found";
      console.log("Response not found in MongoDB");
    }
  } catch (error) {
    console.error("Error deleting response from MongoDB:", error);
    ctx.status = 500;
    ctx.body = "Error deleting response from MongoDB";
  }
});


//Increment numResponses for a task
router.put("/HIP/incrementNumReviews", async (ctx) => {
  const data = ctx.request.body;
  console.log(data);
  console.log(`Incrementing responses for id: ${data.id}`); // Log the id to check if it's correct

  try {
    const collection = database.collection("tasks");
    const filter = { id: data.id };

    const document = await collection.findOne(filter);

    if (!document) {
      console.warn("No task found with the specified id");
      ctx.status = 404;
      ctx.body = "No task found with the specified id";
    } else {
      const numResponses = parseInt(document.numResponses, 10) || 0;
      const updatedNumResponses = numResponses + 1;

      const update = { $set: { numResponses: updatedNumResponses.toString() } };
      await collection.updateOne(filter, update);

      ctx.body = "Number of responses incremented successfully!";
      console.log("Number of responses incremented");
    }
  } catch (error) {
    console.error("Error incrementing number of responses:", error);
    ctx.status = 500;
    ctx.body = "Error incrementing number of responses";
  }
});

// Get the number of responses for an Ethereum address

router.get("/HIP/getReviewerCount/:address", async (ctx) => {
  const address = ctx.params.address;

  try {
    const collection = database.collection("respondents");
    const filter = { address: address };
    const projection = { _id: 0, responseCount: 1 }; // Only return the responseCount field
    const result = await collection.findOne(filter, { projection });

    if (result) {
      ctx.body = result;
      console.log("Respondent count fetched:", result.responseCount);
    } else {
      ctx.body = { responseCount: "0" }; // Return responseCount as a string, similar to the database
      console.log("No responses found for the given address");
    }
  } catch (error) {
    console.error("Error fetching respondent count:", error);
    ctx.status = 500;
    ctx.body = "Error fetching respondent count";
  }
});

// Increment the task count for a proposer address
router.put("/HIP/incrementProposerCount", async (ctx) => {
  const data = ctx.request.body;
  console.log(data);

  try {
    const collection = database.collection("proposers");
    const filter = { address: data.address };

    const document = await collection.findOne(filter);

    if (!document) {
      const newDocument = { address: data.address, taskCount: "1" };
      await collection.insertOne(newDocument);
      ctx.body =
        "Task count incremented successfully! (New document created)";
    } else {
      const taskCount = parseInt(document.taskCount, 10) || 0;
      const updatedTaskCount = taskCount + 1;
      const update = { $set: { taskCount: updatedTaskCount.toString() } };
      await collection.updateOne(filter, update);

      ctx.body = "Task count incremented successfully!";
    }

    console.log("Task count incremented");
  } catch (error) {
    console.error("Error incrementing task count:", error);
    ctx.status = 500;
    ctx.body = "Error incrementing reviewer count";
  }
});
// Decrement task count 
router.put("/HIP/decrementProposerCount", async (ctx) => {
  const data = ctx.request.body;
  console.log(data);

  try {
    const collection = database.collection("proposers");
    const filter = { address: data.address };

    const document = await collection.findOne(filter);

    if (!document) {
      console.warn("No proposer found with the specified address");
      ctx.status = 404;
      ctx.body = "No proposer found with the specified address";
      return;
    }

    const taskCount = parseInt(document.taskCount, 10) || 0;

    if (taskCount <= 0) {
      console.warn("Task count is already 0 or negative");
      ctx.status = 400;
      ctx.body = "Task count is already 0 or negative";
      return;
    }

    const updatedTaskCount = taskCount - 1;
    const update = { $set: { taskCount: updatedTaskCount.toString() } };
    await collection.updateOne(filter, update);

    ctx.body = "Task count decremented successfully!";
    console.log("Task count decremented");
  } catch (error) {
    console.error("Error decrementing task count:", error);
    ctx.status = 500;
    ctx.body = "Error decrementing task count";
  }
});

// Get the task count for a proposer's Ethereum address
router.get("/HIP/getProposerTaskCount/:address", async (ctx) => {
  const address = ctx.params.address;

  try {
    const collection = database.collection("proposers");
    const filter = { address: address };
    const projection = { _id: 0, taskCount: 1 }; // Only return the taskCount field

    const result = await collection.findOne(filter, { projection });

    if (result) {
      ctx.body = result;
      console.log("Task count fetched:", result.taskCount);
    } else {
      ctx.body = { taskCount: "0" };  // Return taskCount as a string, similar to the database
      console.log("No tasks found for the given address");
    }
  } catch (error) {
    console.error("Error fetching task count:", error);
    ctx.status = 500;
    ctx.body = "Error fetching task count";
  }
});


// Increment the respondent's response count for an Ethereum address
router.put("/HIP/incrementReviewerCount", async (ctx) => {
  const data = ctx.request.body;
  console.log(data);

  try {
    const collection = database.collection("respondents");
    const filter = { address: data.address };

    const document = await collection.findOne(filter);

    if (!document) {
      const newDocument = { address: data.address, reviewCount: "1" };
      await collection.insertOne(newDocument);
      ctx.body =
        "Reviewer count incremented successfully! (New document created)";
    } else {
      const reviewCount = parseInt(document.reviewCount, 10) || 0;
      const updatedReviewCount = reviewCount + 1;
      const update = { $set: { reviewCount: updatedReviewCount.toString() } };
      await collection.updateOne(filter, update);

      ctx.body = "Reviewer count incremented successfully!";
    }

    console.log("Reviewer count incremented");
  } catch (error) {
    console.error("Error incrementing reviewer count:", error);
    ctx.status = 500;
    ctx.body = "Error incrementing reviewer count";
  }
});

//Send HIP to frontend
router.post("/getMyJSON", async (ctx) => {
  try {
    const collection = database.collection("tasks");
    const data = await collection.find().toArray();
    ctx.body = data;
  } catch (error) {
    console.error("Error getting data from MongoDB:", error);
    ctx.status = 500;
    ctx.body = "Error getting data from MongoDB";
  }
});

router.get("/reviews/:id", async (ctx) => {
  const id = ctx.params.id;

  try {
    const taskCollection = database.collection("tasks");
    const taskDoc = await taskCollection.findOne({
      id: parseInt(id),
    });
    console.log(id);
    if (!taskDoc) {
      ctx.status = 404;
      ctx.body = { error: "Document not found in the collection." };
      return;
    }

    const numResponses = manuscriptDoc.numResponses;
    const responsesCollection = database.collection("responses");

    const responses = await responsesCollection
      .find({ id: parseInt(id) })
      .limit(parseInt(numResponses))
      .toArray();
    console.log("Fetched responses:", responses);

    ctx.status = 200;
    ctx.body = responses;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: "An error occurred while fetching responses." };
  }
});

// Getting the number of HIPs in the database
router.get("/HIP/getLatestId", async (ctx) => {
  try {
    const collection = database.collection("tasks");

    const latestDocument = await collection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    if (latestDocument.length === 0) {
      ctx.body = "0";
    } else {
      ctx.body = (parseInt(latestDocument[0].id, 10) + 1).toString();
    }
  } catch (error) {
    console.error("Error fetching the latest document id:", error);
    ctx.status = 500;
    ctx.body = "Error fetching the latest document id";
  }
});

app.use(cors());
app.use(router.routes()).use(router.allowedMethods());
app.use(serve(UPLOAD_DIR));

// Route for uploading single files
router.post("/upload-single-file", upload.single("file"), (ctx) => {
  ctx.body = {
    message: `file ${ctx.request.file.filename} was saved on the server`,
    url: `http://localhost:${PORT}/${ctx.request.file.originalname}`,
  };
});



(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas.");
    database = client.db("cognize");

    app.listen(PORT, () => {
      console.log(`Server starting at port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err);
  }
})();

//Decrement number of responses for task
router.put("/HIP/decrementNumReviews", async (ctx) => {
  const data = ctx.request.body;
  console.log(`Decrementing responses for id: ${data.id}`);

  try {
    const collection = database.collection("tasks");
    const filter = { id: data.id };
    const document = await collection.findOne(filter);

    if (!document) {
      console.warn("No task found with the specified id");
      ctx.status = 404;
      ctx.body = "No task found with the specified id";
      return;
    }

    const numResponses = parseInt(document.numResponses, 10) || 0;
    if (numResponses <= 0) {
      console.warn("Number of responses is already 0 or negative");
      ctx.status = 400;
      ctx.body = "Number of responses is already 0 or negative";
      return;
    }

    const updatedNumResponses = numResponses - 1;
    const update = { $set: { numResponses: updatedNumResponses.toString() } };
    await collection.updateOne(filter, update);

    ctx.body = "Number of responses decremented successfully!";
    console.log("Number of responses decremented");
  } catch (error) {
    console.error("Error decrementing number of responses:", error);
    ctx.status = 500;
    ctx.body = "Error decrementing number of responses";
  }
});

//Decrement number of responses for respondent 
router.put("/HIP/decrementReviewerCount", async (ctx) => {
  const data = ctx.request.body;
  console.log(`Decrementing response count for address: ${data.address}`);

  try {
    const collection = database.collection("respondents");
    const filter = { address: data.address };
    const document = await collection.findOne(filter);

    if (!document) {
      console.warn("No respondent found with the specified address");
      ctx.status = 404;
      ctx.body = "No respondent found with the specified address";
      return;
    }

    const responseCount = parseInt(document.reviewCount, 10) || 0;
    if (responseCount <= 0) {
      console.warn("Response count is already 0 or negative");
      ctx.status = 400;
      ctx.body = "Response count is already 0 or negative";
      return;
    }

    const updatedResponseCount = responseCount - 1;
    const update = { $set: { reviewCount: updatedResponseCount.toString() } };
    await collection.updateOne(filter, update);

    ctx.body = "Response count decremented successfully!";
    console.log("Response count decremented");
  } catch (error) {
    console.error("Error decrementing response count:", error);
    ctx.status = 500;
    ctx.body = "Error decrementing response count";
  }
});
