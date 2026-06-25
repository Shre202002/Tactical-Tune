import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchAccount = createServerFn({ method: "GET" }).handler(async () => {
  const { requireUser } = await import("@/server/auth.server");
  return requireUser();
});

export const saveAccount = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullName: z.string().max(120),
      phone: z.string().max(30),
    }),
  )
  .handler(async ({ data }) => {
    const { updateCurrentProfile } = await import("@/server/auth.server");
    return updateCurrentProfile(data);
  });
