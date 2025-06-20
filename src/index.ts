// src/index.ts
import express, { Request, Response } from "express";
import prisma from "./prisma";
import { Record } from "./types";
import { secondaryContacts, uniqueEmails, uniquePhoneNumbers } from "./tasks";

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;

app.use(express.json()); // Required for parsing JSON in POST

interface IdentifyRequestBody {
  email?: string;
  phoneNumber?: string;
}

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

app.post(
  "/identify",
  async (
    req: Request<{}, {}, IdentifyRequestBody>,
    res: Response
  ): Promise<any> => {
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber
      ? parseInt(req.body.phoneNumber)
      : null;

    if (!email && !phoneNumber) {
      res.status(400).json({ error: "Provide at least email or phoneNumber" });
    }
    try {
      const emailRecord: Record = await prisma.identify.findMany({
        where: {
          email: email,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const phoneRecord: Record = await prisma.identify.findMany({
        where: {
          phoneNumber: phoneNumber,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      let identify;
      let totalRecord = [...emailRecord, ...phoneRecord].sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      if (emailRecord.length > 0 && phoneRecord.length > 0) {
        await prisma.identify.updateMany({
          where: {
            id: totalRecord[totalRecord.length - 1].id,
          },
          data: {
            linkedId: totalRecord[0].id,
            linkPrecedence: "secondary",
          },
        });
        totalRecord = await prisma.identify.findMany({
          where: {
            OR: [{ linkedId: totalRecord[0].id }, { id: totalRecord[0].id }],
          },
          orderBy: {
            createdAt: "asc",
          },
        });
        console.log(totalRecord);
      } else if (emailRecord.length > 0) {
        identify = await prisma.identify.create({
          data: {
            email,
            phoneNumber: phoneNumber ? Number(phoneNumber) : undefined,
            linkPrecedence: "secondary",
            linkedId: emailRecord[0].id,
          },
        });
        totalRecord.push(identify);
      } else if (phoneRecord.length > 0) {
        identify = await prisma.identify.create({
          data: {
            email,
            phoneNumber: phoneNumber ? Number(phoneNumber) : undefined,
            linkPrecedence: "secondary",
            linkedId: phoneRecord[0].id,
          },
        });
        totalRecord.push(identify);
      } else {
        identify = await prisma.identify.create({
          data: {
            email,
            phoneNumber: phoneNumber ? Number(phoneNumber) : undefined,
          },
        });
        totalRecord.push(identify);
      }
      // console.log("totalRecord", totalRecord);

      const contact = {
        primaryContatctId: totalRecord[0]?.id,
        emails: uniqueEmails(totalRecord),
        phoneNumbers: uniquePhoneNumbers(totalRecord),
        secondaryContactIds: secondaryContacts(totalRecord),
      };
      res.status(201).json({
        message: "Data saved successfully",
        contact: contact,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Email already exists" });
      }
      console.error(error);
      // res.status(500).json({ error: 'Database error' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
