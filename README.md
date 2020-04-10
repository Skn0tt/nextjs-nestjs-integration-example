# Integrating Next.js and NestJS

## Foreword

While working on [hilfehub.org](https://hilfehub.org), I got to know [Next.js](https://nextjs.org/) and found it to be really great.
Especially the integration of API routes is a very nice feature to have - and having worked using a multi-service architecture in the past, I found it a joy to have a single monolith.
So I decided to make an effort to migrate [EntE](https://ente.app) (my biggest project to date) to use Next.js.
Having a monolith will hopefully decrease deployment and development complexity by far - at the moment, theres just a lot going on in the EntE repo.

## The Problem

I've got a fully-working NestJS-based backend, which I don't want to throw away just to migrate to Next.js.
So the goal is to hook up Next.js' API mechanism to my existing backend.

While there's the option to define a [Custom Server](https://nextjs.org/docs/advanced-features/custom-server) for Next.js, that's discouraged so I wanted to find a way around it.
In this example, we'll make use of [Dynamic API Routes](https://nextjs.org/docs/api-routes/dynamic-api-routes) to define a Catch-All-Route which will then relay to our NestJS instance.

That's done by creating a file called `/api/[...catchAll].ts`, which - surprise - will catch all requests to `/api`.
In Next.JS, API routes look like this:

```ts
export default async (request, response) => {
  // do something with `request` and `response``
  response.status(200).send("Hello World");
}
```

That's basically the interface of Node's `http.Server` Handlers, and since NestJS uses Express internally, which uses http.Server internally, there needs to be away to integrate that with NestJS, surely?
Turns out: there is!

On a high level, what we're going to do is getting that request handler from NestJS and pass our `request` and `response` into it.

```ts
async function getNestJSRequestHandler() {
  // I will init the NestJS application,
  // get the `http.Server` it's running
  // and return the registered request handler.
}

export default async (request, response) => {
  const handler = await getNestJSRequestHandler();
  handler(request, response);
}
```

So let's go over how that's done.

### 1. Init the NestJS application

Initializing the NestJS app is the easiest part:

```ts
const app = await NestFactory.create(AppModule);

// because our routes are served under `/api`
app.setGlobalPrefix("api") 

await app.init();
```

### 2. Get the `http.Server`

Now we need to get the app's integrated `http.Server`.
NestJS is kind to us - there's a function to get it!

```ts
const server: http.Server = app.getHttpServer();
```

### 3. Get the registered request handler

This is the hardest part - but with some StackOverflow, I found out how to do it.
There's the `listeners` function, which will return you an array of registered handlers.
In our case, there's exactly one, and that's the one we're looking for!

```ts
const [ requestHandler ] = server.listeners("request") as NextApiHandler[];
```

So once we got the request handler, we can go back to our Next.js API route and finish integration.

## Finishing touches on our catch-all route

While this is working, you'll see an error:

> API resolved without sending a response for /api/randomNumber, this may result in stalled requests.

That's because our catch-all handler finishes execution before the request is fully answered.
While that warning is a false positive, we want it to be fixed nevertheless. 

```ts
export default (request, response) => new Promise(
  async resolve => {
    const listener = await getNestJSRequestHandler();
    listener(request, response);
    response.on("finish", resolve);
  }
);
```

By not using `async` / `await` Syntax but a plain old Promise instead, we can customize when the Handler resolves - we'll resolve it once `response` emits the [`finish` event](https://nodejs.org/api/http.html#http_event_finish), which happens after the last chunk of the body is sent.

## Conclusion

Integrating Next.js and NestJS is easier than thought - and by using this strategy, you can basically connect every `http.Server`-based framework to Next.js.
If you want to see a working example, have a look at the code in this repo.
It's deployed [here](https://nextjs-nestjs-integration-example.simonknott.de), if you want to see it in action :)
