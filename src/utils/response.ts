import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const apiResponse = (
  c: Context,
  status: StatusCode,
  message: string,
  data: any = null
) => {
  return c.json(
    {
      status: status >= 200 && status < 300 ? "success" : "error",
      message,
      data,
    },
    status as ContentfulStatusCode
  );
};
