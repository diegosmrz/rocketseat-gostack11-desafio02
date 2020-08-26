const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');
const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateUuid(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid project id." })
  }
  return next();
}

//should not be able to update a repository that does not exist
//should not be able to delete a repository that does not exist
function validateRepoExists(request, response, next) {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return response.status(400).json({ message: "Bad Request" })
  }
  return next();
}

//should be able to create a new repository
app.post("/repositories", (request, response) => {
  const { url, title, techs } = request.body;
  const repository = { id: uuid(), url, title, techs, likes: 0 };
  repositories.push(repository);
  return response.json(repository);
});

//should be able to list the repositories
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

//should be able to update repository
app.put("/repositories/:id", validateRepoExists, (request, response) => {
  const { id } = request.params;
  const { url, title, techs, } = request.body;
  const index = repositories.findIndex(repository => repository.id === id);
  const likes = repositories[index].likes;
  if (index < 0) { return response.status(404); }

  const repository = {
    id, url, title, techs, likes
  };

  repositories[index] = repository;

  return response.json(repository);
});

//should be able to delete the repository
app.delete("/repositories/:id", validateUuid, validateRepoExists, (request, response) => {
  const { id } = request.params;
  const index = repositories.findIndex(repository => repository.id === id);
  if (index < 0) {
    return response.status(400);
  }
  repositories.splice(index, 1);
  return response.status(200);
});

//should be able to give a like to the repository
app.post("/repositories/:id/like", validateUuid, (request, response) => {
  const { id } = request.params;
  const { url, title, techs, } = request.body;
  const index = repositories.findIndex(repository => repository.id === id);
  const likes = repositories[index].likes + 1;
  if (index < 0) { return response.status(404); }
  const repository = {
    id, url, title, techs, likes
  };
  repositories[index] = repository;
  return response.json(repository);
});

module.exports = app;
