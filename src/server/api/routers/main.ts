import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { GenerateSchema } from "@schemas/Generate";

export const generatorRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(GenerateSchema)
    .mutation(async ({ input, ctx }) => {
      const { openai, prisma, session } = ctx;
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          credits: true,
        },
      });

      if (!user) {
        throw new Error("Unaable to find user");
      }

      if (user.credits <= 0) {
        throw new Error("Not enough credits");
      }

      const response = await openai.createImage({
        prompt: input.prompt,
        n: 1,
        // size: "1024x1024",
        size: "512x512",
      });
      const responseData = response?.data?.data;

      const data = responseData.map((d) => {
        return {
          image: d.url || "",
          prompt: input.prompt,
          userId: session.user.id,
        };
      });

      // https://oaidalleapiprodscus.blob.core.windows.net/private/org-5AUy0Qjrri8PdzTvZxJ0Nxoe/user-yvXuUi8QyXExPAGdN6wL27yP/img-MlYhTV7r8N2yWjP49FdjsOEJ.png?st=2023-02-19T23%3A12%3A03Z&se=2023-02-20T01%3A12%3A03Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-02-19T19%3A35%3A45Z&ske=2023-02-20T19%3A35%3A45Z&sks=b&skv=2021-08-06&sig=Mp7oNvm6N6B0XEHnSNKT8lxJcezLSEiMKZL7b6u0NE4%3D
      const result = await prisma.history.createMany({
        data,
      });

      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          credits: user.credits - data.length,
        },
      });

      // responseData[0]?.url
      return {
        images: responseData,
      };
    }),
});
