const http = require('http');
const fs = require('fs');

// File path for db.json
const dataFilePath = 'db.json';

// Function to read data from db.json
const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return null;
  }
};

// Function to write data to db.json
const writeData = (data) => {
  try {
    const stringifiedData = JSON.stringify(data, null, 2); // Indented for readability
    fs.writeFileSync(dataFilePath, stringifiedData);
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
};

// Function to find data by ID
const findDataById = (data, id) => {
  return data.users.find(user => user.id === id);
};

// Create a server
const server = http.createServer((req, res) => {
  // Set response headers
  res.setHeader('Content-Type', 'application/json');

  // Handle GET requests (Read data)
  if (req.method === 'GET') {
    const data = readData();
    if (data) {
      res.end(JSON.stringify(data));
    } else {
      res.statusCode = 500; // Internal Server Error
      res.end(JSON.stringify({ error: 'Failed to read data' }));
    }
  }

  // Handle POST requests (Create data)
  else if (req.method === 'POST') {
    let newData;
    try {
      newData = JSON.parse(req.body); // Parse incoming JSON data
    } catch (error) {
      res.statusCode = 400; // Bad Request
      res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      return;
    }
    const currentData = readData();
    if (currentData) {
      currentData.users.push(newData);
      writeData(currentData);
      res.end(JSON.stringify({ message: 'Data created successfully' }));
    } else {
      res.statusCode = 500; // Internal Server Error
      res.end(JSON.stringify({ error: 'Failed to create data' }));
    }
  }

  // Handle PUT requests (Update data)
  else if (req.method === 'PUT') {
    let updatedData;
    try {
      updatedData = JSON.parse(req.body); // Parse incoming JSON data
    } catch (error) {
      res.statusCode = 400; // Bad Request
      res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      return;
    }
    const currentData = readData();
    if (currentData) {
      const existingData = findDataById(currentData, updatedData.id);
      if (existingData) {
        // Update the properties of the existing data object
        existingData.name = updatedData.name;
        existingData.email = updatedData.email;
        writeData(currentData);
        res.end(JSON.stringify({ message: 'Data updated successfully' }));
      } else {
        res.statusCode = 404; // Not Found
        res.end(JSON.stringify({ error: 'Data with specified ID not found' }));
      }
    } else {
      res.statusCode = 500; // Internal Server Error
      res.end(JSON.stringify({ error: 'Failed to update data' }));
    }
  }

  // Handle DELETE requests (Delete data)
  else if (req.method === 'DELETE') {
    const userId = req.url.slice(1); // Extract ID from URL path
    const currentData = readData();
    if (currentData) {
      const index = currentData.users.findIndex(user => user.id === userId);
      if (index !== -1) {
        currentData.users.splice(index, 1);
        writeData(currentData);
        res.end(JSON.stringify({ message: 'Data deleted successfully' }));
      } else {
        res.statusCode = 404; // Not Found
        res.end(JSON.stringify({ error: 'Data with specified ID not found' }));
      }
    } else {
      res.statusCode = 500; // Internal Server Error
      res.end(JSON.stringify({ error: 'Failed to delete data' }));
    }
  }

  // Handle other HTTP methods
  else {
    res.statusCode = 405; // Method Not Allowed
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
