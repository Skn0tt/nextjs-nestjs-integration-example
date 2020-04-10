# Integrating Next.js and NestJS

## Foreword

While working on [hilfehub.org](https://hilfehub.org), I got to know [Next.js](https://nextjs.org/) and found it to be really great.
Especially the integration of API routes is a very nice feature to have - and having worked using multi-service architectures in the past, I found it a joy to be working on a single monolith.
So I decided to make an effort to migrate [EntE](https://ente.app) (my biggest project to date) to use Next.js.
Having a monolith will hopefully decrease deployment and development complexity - at the moment, theres just a lot going on in the EntE repository.

## The Problem

I've got a fully-working NestJS-based backend, which I don't want to throw away just to migrate to Next.js.
So the goal is to hook up Next.js' API mechanism to my existing backend.

Since defining a [Custom Server](https://nextjs.org/docs/advanced-features/custom-server) is discouraged in Next.js' docs, I wanted to find a way around doing that.
In this example, we'll make use of [Dynamic API Routes](https://nextjs.org/docs/api-routes/dynamic-api-routes).
We'll define a Catch-All-Route and forward incoming requests to our NestJS instance.

That's done by creating a file called `/api/[...catchAll].ts`, which - surprise - will catch all requests to `/api`.
In Next.JS, API routes look like this:

```ts
export default async (request, response) => {
  // do something with `request` and `response``
  response.status(200).send("Hello World");
}
```

That's basically the interface of Node's `http.Server` Handlers, and since NestJS uses Express internally, which uses http.Server internally, there surely is a away to integrate that with NestJS, right?
Turns out: there is!

On a high level, this is what we're going to do: We'll get the request handler from our NestJS application and pass our `request` and `response` into it.

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

So let's have a look at how that's done.

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
NestJS is kind to us - there's a function for it!

```ts
const server: http.Server = app.getHttpServer();
```

### 3. Get the registered request handler

This is the hardest part - but with the help of StackOverflow, I found out how to do it.
On `http.Server`, there's the `listeners` function.
It will return you an array of registered handlers.
In our case, there's exactly one, and that's the one we're looking for!

```ts
const [ requestHandler ] = server.listeners("request") as NextApiHandler[];
```

So now we've got our request handler.
Let's get back to our Next.js API route and finish integration.

## Finishing touches on our catch-all route

Although the method above is functioning, you'll see a warning:

> API resolved without sending a response for /api/, this may result in stalled requests.

That's because our catch-all handler finishes execution before the request is fully answered.
In reality, all requests are answered, so that warning is a false positive, but let's fix it nevertheless. 

```ts
export default (request, response) => new Promise(
  async resolve => {
    const listener = await getNestJSRequestHandler();
    listener(request, response);
    response.on("finish", resolve);
  }
);
```

By not using `async` / `await` Syntax but a plain old Promise instead, we can customize when the handler resolves.
Our request is finished once `response` emits the [`finish` event](https://nodejs.org/api/http.html#http_event_finish),
so that's when we'll resolve our handler.

## Conclusion

Integrating Next.js and NestJS is easier than it seems - and by using this strategy, you can basically connect every `http.Server`-based framework to Next.js.
If you want to see a working example, have a look at the code in this repo, which you can see in action [here](https://nextjs-nestjs-integration-example.simonknott.de).
