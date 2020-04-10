import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const randomNumber = Math.random() * 1000;
  res.status(200).send(randomNumber);
}