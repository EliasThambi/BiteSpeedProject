// src/index.ts
import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json()); // Required for parsing JSON in POST

app.get("/identify", (req: Request, res: Response) => {
  res.send(`
    <html>
      <body>
        <h2>Submit Identify Form</h2>
        <form action="/identify" method="POST">
          <label>Email:</label>
          <input type="email" name="email" /><br/><br/>
          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" /><br/><br/>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
