import { PassThrough } from "stream";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

type Handler = (context: EntryContext, options: { request: Request; responseHeaders: Headers; loadContext: AppLoadContext }) => Promise<Response>;

const handleRequest: Handler = async (context, { request, responseHeaders }) => {
  const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";

  return await new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(<RemixServer context={context} url={request.url} />, {
      [callbackName]() {
        const body = new PassThrough();

        responseHeaders.set("Content-Type", "text/html");

        resolve(
          new Response(body as any, {
            status: didError ? 500 : 200,
            headers: responseHeaders
          })
        );

        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        didError = true;
        console.error(error);
      }
    });

    setTimeout(abort, ABORT_DELAY);
  });
};

export default handleRequest;
