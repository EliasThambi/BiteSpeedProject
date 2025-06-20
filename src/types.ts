export type Record = {
  id: number;
  email: string | null;
  phoneNumber: number | null;
  linkedId: number | null;
  linkPrecedence: "primary" | "secondary";
  createdAt: Date | "";
  updatedAt: Date | "";
  deletedAt: Date | null;
}[];