import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { GenerateSchema } from "@schemas/Generate";
import { TRPCError } from "@trpc/server";

export const generatorRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(GenerateSchema)
    .mutation(async ({ input, ctx }) => {
      const { openai, prisma, session } = ctx;

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
          // throw new Error(`User does not have enough credits`);
          throw new TRPCError({
            message: "Not enough credits",
            code: "BAD_REQUEST",
          });
        }
      });

      let response;
      try {
        if (input.file) {
          const buffer: Buffer = Buffer.from(input.file, "base64");
          // Cast the buffer to `any` so that we can set the `name` property
          const file: any = buffer;
          // Set a `name` that ends with .png so that the API knows it's a PNG image
          file.name = "image.png";
          response = await openai.createImageVariation(file, 1, "512x512");
        } else {
          response = await openai.createImage({
            prompt: input.prompt,
            n: 1,
            // size: "1024x1024",
            size: "512x512",
          });
        }
      } catch (error: any) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
        throw new TRPCError({
          message: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const responseData = response?.data?.data;

      // Test mock data
      // const responseData = [
      //   {
      //     url: "https://www.livingthecode.life/_next/image?url=%2Fjimmy.jpeg&w=256&q=75",
      //     // url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-5AUy0Qjrri8PdzTvZxJ0Nxoe/user-yvXuUi8QyXExPAGdN6wL27yP/img-gWP9Nyj4d8lwBgFMGtC64DxC.png?st=2023-03-03T22%3A05%3A20Z&se=2023-03-04T00%3A05%3A20Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-03-03T19%3A16%3A51Z&ske=2023-03-04T19%3A16%3A51Z&sks=b&skv=2021-08-06&sig=I/XmRM9CnKUYzb22vaIOtgemgfZFAkKeodZk05FiYqA%3D",
      //   },
      // ];

      const responsePromises = responseData.map(async (d) => {
        // const url = await uploadToS3(d.url);
        const url = d.url;
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
