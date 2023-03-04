import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const conceptsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.history.findMany({});
  }),
  getUserHistory: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.history.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
