import S3 from "aws-sdk/clients/s3";
import { env } from "~/env.mjs";
export const s3 = new S3({
  region: "us-east-2",
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_SECRET_KEY,
  signatureVersion: "v4",
});

export type S3Type = S3;
