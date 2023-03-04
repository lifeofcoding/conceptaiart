import { v4 as uuidv4 } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "~/env.mjs";

export const s3 = new S3Client({
  region: "us-east-2",
  logger: env.NODE_ENV === "development" ? console : undefined,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (url: string | undefined) => {
  if (!url) return null;

  const Key = uuidv4() + ".png";

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.warn(error);
    return null;
  }

  if (!response.body) {
    return null;
  }
  const fileContent = response.body;

  try {
    const parallelUploads3 = new Upload({
      client: s3,
      params: {
        Bucket: "conceptaiart",
        Key,
        Body: fileContent,
      },

      tags: [
        /*...*/
      ], // optional tags
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log("Upload Progress", progress);
    });

    await parallelUploads3.done();
    return `https://conceptaiart.s3.us-east-2.amazonaws.com/${Key}`;
  } catch (e) {
    console.log(e);
    return null;
  }
};
