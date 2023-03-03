import { v4 as uuidv4 } from "uuid";
import { S3Type } from "~/utils/s3";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { GenerateSchema } from "@schemas/Generate";
import { TRPCError } from "@trpc/server";

const uploadToS3 = async (s3: S3Type, url: string | undefined) => {
  if (!url) return null;

  const r = /(?<=img-\s*).*?(?=\s*.png)/gs;

  const fileName = url.match(r);
  const response = await fetch(url);
  const fileContent = await response.arrayBuffer();
  const params = {
    Bucket: "conceptaiart",
    Key: fileName + ".png",
    Body: fileContent,
  };

  try {
    const res = await s3.upload(params).promise();
    return res.Location;
  } catch (error) {
    console.warn(error);
    return null;
  }
};

export const generatorRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(GenerateSchema)
    .mutation(async ({ input, ctx }) => {
      const { openai, prisma, session, s3 } = ctx;

      await prisma.$transaction(async (tx) => {
        const sender = await tx.user.update({
          data: {
            credits: {
              decrement: 1,
            },
          },
          where: {
            id: session.user.id,
          },
        });

        // 2. Verify that the sender's balance didn't go below zero.
        if (sender.credits < 0) {
          // throw new Error(`User does not havce enbough credits`);
          throw new TRPCError({
            message: "Not enough credits",
            code: "BAD_REQUEST",
          });
        }
      });

      // const user = await prisma.user.findUnique({
      //   where: {
      //     id: session.user.id,
      //   },
      //   select: {
      //     credits: true,
      //   },
      // });

      // if (!user) {
      //   throw new TRPCError({
      //     message: "Unable to find user",
      //     code: "BAD_REQUEST",
      //   });
      // }

      // if (user.credits <= 0) {
      //   throw new TRPCError({
      //     message: "Not enough credits",
      //     code: "BAD_REQUEST",
      //   });
      // }

      const response = await openai.createImage({
        prompt: input.prompt,
        n: 1,
        // size: "1024x1024",
        size: "512x512",
      });
      const responseData = response?.data?.data;

      // const responseData = [
      //   {
      //     url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-5AUy0Qjrri8PdzTvZxJ0Nxoe/user-yvXuUi8QyXExPAGdN6wL27yP/img-MlYhTV7r8N2yWjP49FdjsOEJ.png?st=2023-02-19T23%3A12%3A03Z&se=2023-02-20T01%3A12%3A03Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-02-19T19%3A35%3A45Z&ske=2023-02-20T19%3A35%3A45Z&sks=b&skv=2021-08-06&sig=Mp7oNvm6N6B0XEHnSNKT8lxJcezLSEiMKZL7b6u0NE4%3D",
      //   },
      // ];

      const responsePromises = responseData.map(async (d) => {
        const url = await uploadToS3(s3, d.url);
        return {
          image: url || "",
          prompt: input.prompt,
          userId: session.user.id,
        };
      });

      const data = await Promise.all(responsePromises);
      const images = data.filter((d) => d.image);

      await prisma.history.createMany({
        data: images,
      });

      // await prisma.user.update({
      //   where: {
      //     id: session.user.id,
      //   },
      //   data: {
      //     credits: user.credits - data.length,
      //   },
      // });

      // responseData[0]?.url
      return {
        images,
      };
    }),
  getCredits: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        credits: true,
      },
    });
  }),
});
