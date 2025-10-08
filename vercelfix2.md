20:51:18.886 Running build in Washington, D.C., USA (East) – iad1
20:51:18.887 Build machine configuration: 2 cores, 8 GB
20:51:18.900 Cloning github.com/samlupson2171/infinityagentsoct (Branch: main, Commit: f6695bb)
20:51:18.909 Skipping build cache, deployment was triggered without cache.
20:51:19.343 Cloning completed: 443.000ms
20:51:20.162 Running "vercel build"
20:51:20.560 Vercel CLI 48.2.4
20:51:21.027 Running "install" command: `npm install`...
20:51:24.302 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
20:51:25.443 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
20:51:25.815 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
20:51:27.360 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
20:51:27.388 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
20:51:28.133 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:51:31.817 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
20:51:43.091 
20:51:43.091 added 738 packages, and audited 739 packages in 22s
20:51:43.092 
20:51:43.092 196 packages are looking for funding
20:51:43.092   run `npm fund` for details
20:51:43.193 
20:51:43.194 6 vulnerabilities (1 low, 3 moderate, 1 high, 1 critical)
20:51:43.194 
20:51:43.194 To address issues that do not require attention, run:
20:51:43.194   npm audit fix
20:51:43.194 
20:51:43.194 To address all issues possible, run:
20:51:43.194   npm audit fix --force
20:51:43.194 
20:51:43.194 Some issues need review, and may require choosing
20:51:43.194 a different dependency.
20:51:43.194 
20:51:43.194 Run `npm audit` for details.
20:51:43.508 Detected Next.js version: 14.2.5
20:51:43.512 Running "npm run build"
20:51:43.659 
20:51:43.659 > infinity-weekends-website@0.1.0 build
20:51:43.660 > DISABLE_TINYMCE=true next build
20:51:43.660 
20:51:44.605 Attention: Next.js now collects completely anonymous telemetry regarding usage.
20:51:44.606 This information is used to shape Next.js' roadmap and prioritize features.
20:51:44.606 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
20:51:44.606 https://nextjs.org/telemetry
20:51:44.606 
20:51:44.847   ▲ Next.js 14.2.5
20:51:44.848 
20:51:45.096    Creating an optimized production build ...
20:52:13.251  ✓ Compiled successfully
20:52:13.252    Skipping validation of types
20:52:13.252    Skipping linting
20:52:13.560    Collecting page data ...
20:52:14.404 🔍 Validating environment configuration...
20:52:14.406 ❌ Environment validation failed
20:52:14.407 
20:52:14.407 🚨 Critical Issues:
20:52:14.407    MONGODB_URI: Contains potentially unsafe credential pattern
20:52:14.407 
20:52:14.408 📖 For setup instructions, see LAUNCH_GUIDE.md or run: node check-env.js
20:52:14.463 (node:325) [MONGOOSE] Warning: Duplicate schema index on {"version":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
20:52:14.463 (Use `node --trace-warnings ...` to show where the warning was created)
20:52:14.619 (node:325) [MONGOOSE] Warning: Duplicate schema index on {"timestamp":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
20:52:14.681 (node:325) [MONGOOSE] Warning: Duplicate schema index on {"key":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
20:52:14.698 (node:325) [MONGOOSE] Warning: Duplicate schema index on {"associatedMaterial":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
20:52:17.263    Generating static pages (0/90) ...
20:52:18.579 Error fetching agencies: q [Error]: Dynamic server usage: Route /api/admin/agencies couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:18.580     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:18.581     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:18.581     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:18.581     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:18.581     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:18.582     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:18.582     at p (/vercel/path0/.next/server/app/api/admin/agencies/route.js:1:873)
20:52:18.582     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:18.582     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:18.583     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:18.583   description: "Route /api/admin/agencies couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:18.583   digest: 'DYNAMIC_SERVER_USAGE'
20:52:18.583 }
20:52:18.612 Error fetching agency stats: q [Error]: Dynamic server usage: Route /api/admin/agencies/stats couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:18.613     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:18.613     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:18.613     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:18.613     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:18.614     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:18.614     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:18.614     at p (/vercel/path0/.next/server/app/api/admin/agencies/stats/route.js:1:873)
20:52:18.614     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:18.614     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:18.614     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:18.615   description: "Route /api/admin/agencies/stats couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:18.618   digest: 'DYNAMIC_SERVER_USAGE'
20:52:18.618 }
20:52:18.657 Error fetching contract signatures: n [Error]: Dynamic server usage: Route /api/admin/contracts/signatures couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:18.658     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:18.658     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:18.658     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:18.658     at m (/vercel/path0/.next/server/app/api/admin/contracts/signatures/route.js:1:1363)
20:52:18.658     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:18.658     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:18.658     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:18.659     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:18.659     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:18.659     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:18.659   description: "Route /api/admin/contracts/signatures couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:18.659   digest: 'DYNAMIC_SERVER_USAGE'
20:52:18.659 }
20:52:18.793 Error fetching destination activity: n [Error]: Dynamic server usage: Route /api/admin/destinations/activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:18.793     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:18.794     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:18.794     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:18.794     at m (/vercel/path0/.next/server/app/api/admin/destinations/activity/route.js:1:1355)
20:52:18.794     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:18.794     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:18.795     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:18.795     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:18.795     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:18.795     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:18.795   description: "Route /api/admin/destinations/activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:18.796   digest: 'DYNAMIC_SERVER_USAGE'
20:52:18.796 }
20:52:19.007 Error fetching pending approvals: n [Error]: Dynamic server usage: Route /api/admin/destinations/pending-approval couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:19.007     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:19.007     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:19.007     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:19.007     at l (/vercel/path0/.next/server/app/api/admin/destinations/pending-approval/route.js:1:1353)
20:52:19.008     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:19.013     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:19.013     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:19.013     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:19.014     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:19.014     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:19.014   description: "Route /api/admin/destinations/pending-approval couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:19.014   digest: 'DYNAMIC_SERVER_USAGE'
20:52:19.014 }
20:52:19.086 Error fetching destination stats: n [Error]: Dynamic server usage: Route /api/admin/destinations/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:19.092     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:19.092     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:19.092     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:19.092     at m (/vercel/path0/.next/server/app/api/admin/destinations/stats/route.js:1:1354)
20:52:19.092     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:19.092     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:19.093     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:19.093     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:19.093     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:19.093     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:19.096   description: "Route /api/admin/destinations/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:19.096   digest: 'DYNAMIC_SERVER_USAGE'
20:52:19.096 }
20:52:19.203 Error validating slug: n [Error]: Dynamic server usage: Route /api/admin/destinations/validate-slug couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:19.204     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:19.205     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:19.205     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:19.205     at l (/vercel/path0/.next/server/app/api/admin/destinations/validate-slug/route.js:1:1352)
20:52:19.206     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:19.206     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:19.206     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:19.206     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:19.206     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:19.207     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:19.207   description: "Route /api/admin/destinations/validate-slug couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:19.207   digest: 'DYNAMIC_SERVER_USAGE'
20:52:19.207 }
20:52:19.348    Generating static pages (22/90) 
20:52:19.491 MongoServerSelectionError: connection <monitor> to 65.62.36.126:27017 closed
20:52:19.491     at Timeout._onTimeout (/vercel/path0/node_modules/mongodb/lib/sdam/topology.js:278:38)
20:52:19.491     at listOnTimeout (node:internal/timers:588:17)
20:52:19.491     at process.processTimers (node:internal/timers:523:7) {
20:52:19.491   reason: TopologyDescription {
20:52:19.491     type: 'ReplicaSetNoPrimary',
20:52:19.491     servers: Map(3) {
20:52:19.491       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
20:52:19.491       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription],
20:52:19.491       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription]
20:52:19.491     },
20:52:19.491     stale: false,
20:52:19.491     compatible: true,
20:52:19.491     heartbeatFrequencyMS: 10000,
20:52:19.491     localThresholdMS: 15,
20:52:19.492     setName: 'atlas-ez1tb1-shard-0',
20:52:19.492     maxElectionId: null,
20:52:19.492     maxSetVersion: null,
20:52:19.492     commonWireVersion: 0,
20:52:19.492     logicalSessionTimeoutMinutes: null
20:52:19.492   },
20:52:19.492   code: undefined,
20:52:19.492   [Symbol(errorLabels)]: Set(0) {}
20:52:19.492 }
20:52:19.682 Error fetching booking analytics: q [Error]: Dynamic server usage: Route /api/admin/quotes/booking-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:19.683     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:19.684     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:19.685     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:19.685     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:19.685     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:19.685     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:19.686     at c (/vercel/path0/.next/server/app/api/admin/quotes/booking-analytics/route.js:1:868)
20:52:19.686     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:19.686     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:19.686     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:19.686   description: "Route /api/admin/quotes/booking-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:19.686   digest: 'DYNAMIC_SERVER_USAGE'
20:52:19.686 }
20:52:19.966 Error fetching email analytics: q [Error]: Dynamic server usage: Route /api/admin/quotes/email-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:19.967     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:19.967     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:19.968     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:19.968     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:19.968     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:19.968     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:19.968     at m (/vercel/path0/.next/server/app/api/admin/quotes/email-analytics/route.js:1:868)
20:52:19.968     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:19.968     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:19.968     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:19.969   description: "Route /api/admin/quotes/email-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:19.969   digest: 'DYNAMIC_SERVER_USAGE'
20:52:19.969 }
20:52:20.101 Quote auth middleware error: q [Error]: Dynamic server usage: Route /api/admin/quotes/export couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.102     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:20.102     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:20.102     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:20.102     at n (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:9830)
20:52:20.102     at u (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:10959)
20:52:20.102     at c (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:11046)
20:52:20.102     at p (/vercel/path0/.next/server/app/api/admin/quotes/export/route.js:1:1046)
20:52:20.102     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.102     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.102     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:20.102   description: "Route /api/admin/quotes/export couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.102   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.102 }
20:52:20.103 Quote export error: Response {
20:52:20.103   status: 500,
20:52:20.103   statusText: '',
20:52:20.103   headers: Headers { 'content-type': 'application/json' },
20:52:20.103   body: ReadableStream { locked: false, state: 'readable', supportsBYOB: true },
20:52:20.103   bodyUsed: false,
20:52:20.103   ok: false,
20:52:20.103   redirected: false,
20:52:20.103   type: 'default',
20:52:20.103   url: ''
20:52:20.103 }
20:52:20.355 Quote search error: n [Error]: Dynamic server usage: Route /api/admin/quotes/search couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.356     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:20.356     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:20.356     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:20.356     at l (/vercel/path0/.next/server/app/api/admin/quotes/search/route.js:1:1355)
20:52:20.356     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.356     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.359     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:20.359     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:20.359     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:20.360     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:20.360   description: "Route /api/admin/quotes/search couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.360   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.360 }
20:52:20.415 Quote stats error: n [Error]: Dynamic server usage: Route /api/admin/quotes/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.416     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:20.416     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:20.417     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:20.417     at p (/vercel/path0/.next/server/app/api/admin/quotes/stats/route.js:1:1355)
20:52:20.417     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.417     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.417     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:20.418     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:20.418     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:20.418     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:20.418   description: "Route /api/admin/quotes/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.419   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.419 }
20:52:20.536 Data integrity API error: q [Error]: Dynamic server usage: Route /api/admin/system/data-integrity couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.536     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:20.537     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:20.537     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:20.537     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:20.537     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:20.537     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:20.537     at h (/vercel/path0/.next/server/app/api/admin/system/data-integrity/route.js:9:138)
20:52:20.538     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.538     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.538     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:20.538   description: "Route /api/admin/system/data-integrity couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.538   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.538 }
20:52:20.567 Download analytics error: n [Error]: Dynamic server usage: Route /api/admin/training/analytics/downloads couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.568     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
20:52:20.568     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
20:52:20.568     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
20:52:20.568     at u (/vercel/path0/.next/server/app/api/admin/training/analytics/downloads/route.js:1:1344)
20:52:20.568     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.568     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.568     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:20.568     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:20.569     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:20.569     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:20.569   description: "Route /api/admin/training/analytics/downloads couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.569   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.569 }
20:52:20.652    Generating static pages (44/90) 
20:52:20.719 Error fetching pending users: q [Error]: Dynamic server usage: Route /api/admin/users/pending couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:20.720     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:20.720     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:20.720     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:20.720     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
20:52:20.720     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
20:52:20.721     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
20:52:20.721     at p (/vercel/path0/.next/server/app/api/admin/users/pending/route.js:1:873)
20:52:20.721     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:20.722     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:20.722     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
20:52:20.722   description: "Route /api/admin/users/pending couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:20.722   digest: 'DYNAMIC_SERVER_USAGE'
20:52:20.722 }
20:52:21.888 Mongoose connected to MongoDB
20:52:21.888 MongoDB connected successfully
20:52:23.323 Error fetching destinations: q [Error]: Dynamic server usage: Route /api/destinations couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:23.323     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:23.324     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:23.324     at p (/vercel/path0/.next/server/app/api/destinations/route.js:1:626)
20:52:23.324     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
20:52:23.325     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
20:52:23.325     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
20:52:23.325     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
20:52:23.325     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
20:52:23.325     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
20:52:23.325     at async Object.exportPage (/vercel/path0/node_modules/next/dist/export/worker.js:236:20) {
20:52:23.326   description: "Route /api/destinations couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:23.326   digest: 'DYNAMIC_SERVER_USAGE'
20:52:23.326 }
20:52:23.756 
20:52:23.757 ⚠️  Application starting with configuration issues.
20:52:23.757 Some features may not work correctly until these are resolved.
20:52:23.787 Error fetching offers: q [Error]: Dynamic server usage: Route /api/offers couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:23.787     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:23.788     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:23.789     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:23.789     at d (/vercel/path0/.next/server/app/api/offers/route.js:1:880)
20:52:23.789     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:23.789     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:23.789     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:23.789     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:23.789     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:23.790     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:23.790   description: "Route /api/offers couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:23.790   digest: 'DYNAMIC_SERVER_USAGE'
20:52:23.790 }
20:52:23.994 Error fetching training materials: q [Error]: Dynamic server usage: Route /api/training couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
20:52:23.995     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
20:52:23.995     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
20:52:23.995     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
20:52:23.995     at c (/vercel/path0/.next/server/app/api/training/route.js:1:884)
20:52:23.995     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
20:52:23.995     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
20:52:23.995     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
20:52:23.995     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
20:52:23.995     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
20:52:23.995     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
20:52:23.995   description: "Route /api/training couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
20:52:23.995   digest: 'DYNAMIC_SERVER_USAGE'
20:52:23.995 }
20:52:24.348 Error: Event handlers cannot be passed to Client Component props.
20:52:24.348   {onUploadComplete: function onUploadComplete}
20:52:24.349                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:52:24.349 If you need interactivity, consider converting part of this to a Client Component.
20:52:24.349     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:52:24.349     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:52:24.349     at stringify (<anonymous>)
20:52:24.349     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:52:24.349     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:52:24.349     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
20:52:24.349     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
20:52:24.349     at listOnTimeout (node:internal/timers:588:17)
20:52:24.350     at process.processTimers (node:internal/timers:523:7) {
20:52:24.350   digest: '3943758011'
20:52:24.350 }
20:52:24.350 Error: Event handlers cannot be passed to Client Component props.
20:52:24.350   {onUploadComplete: function onUploadComplete}
20:52:24.350                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:52:24.350 If you need interactivity, consider converting part of this to a Client Component.
20:52:24.350     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:52:24.351     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:52:24.351     at stringify (<anonymous>)
20:52:24.351     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:52:24.351     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:52:24.351     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:52:24.351     at listOnTimeout (node:internal/timers:588:17)
20:52:24.351     at process.processTimers (node:internal/timers:523:7) {
20:52:24.351   digest: '988311795'
20:52:24.351 }
20:52:24.351 Error: Event handlers cannot be passed to Client Component props.
20:52:24.352   {onUploadComplete: function onUploadComplete}
20:52:24.352                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:52:24.352 If you need interactivity, consider converting part of this to a Client Component.
20:52:24.352     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:52:24.352     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:52:24.352     at stringify (<anonymous>)
20:52:24.352     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:52:24.352     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:52:24.353     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:52:24.353     at listOnTimeout (node:internal/timers:588:17)
20:52:24.353     at process.processTimers (node:internal/timers:523:7) {
20:52:24.353   digest: '988311795'
20:52:24.353 }
20:53:24.316  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
20:53:24.824  ⨯ Static worker exited with code: null and signal: SIGTERM
20:53:24.825  ⚠ Restarted static page generation for /admin/activities because it took more than 60 seconds
20:53:24.825  ⚠ See more info here https://nextjs.org/docs/messages/static-page-generation-timeout
20:53:24.825  ⚠ Restarted static page generation for /admin/contracts because it took more than 60 seconds
20:53:24.825  ⚠ Restarted static page generation for /admin/dashboard because it took more than 60 seconds
20:53:24.826  ⚠ Restarted static page generation for /admin/debug-quote because it took more than 60 seconds
20:53:24.826  ⚠ Restarted static page generation for /admin/destinations/new because it took more than 60 seconds
20:53:24.826  ⚠ Restarted static page generation for /admin/destinations because it took more than 60 seconds
20:53:24.826  ⚠ Restarted static page generation for /admin/enquiries because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /admin/offers because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /admin/quotes because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /admin/simple-quote because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /admin/test-quote because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /admin/test-upload because it took more than 60 seconds
20:53:24.827  ⚠ Restarted static page generation for /auth/login because it took more than 60 seconds
20:53:24.828  ⚠ Restarted static page generation for /auth/pending because it took more than 60 seconds
20:53:24.828  ⚠ Restarted static page generation for /auth/register/confirmation because it took more than 60 seconds
20:53:24.828  ⚠ Restarted static page generation for /auth/register because it took more than 60 seconds
20:53:24.828  ⚠ Restarted static page generation for /auth/register/success because it took more than 60 seconds
20:53:24.828  ⚠ Restarted static page generation for /contract/sign because it took more than 60 seconds
20:53:24.829  ⚠ Restarted static page generation for /destinations/benidorm because it took more than 60 seconds
20:53:24.829  ⚠ Restarted static page generation for /destinations because it took more than 60 seconds
20:53:24.829  ⚠ Restarted static page generation for /enquiries/confirmation because it took more than 60 seconds
20:53:24.829  ⚠ Restarted static page generation for /enquiries because it took more than 60 seconds
20:53:24.829  ⚠ Restarted static page generation for /offers because it took more than 60 seconds
20:53:24.830  ⚠ Restarted static page generation for /packages because it took more than 60 seconds
20:53:24.830  ⚠ Restarted static page generation for / because it took more than 60 seconds
20:53:24.830  ⚠ Restarted static page generation for /training because it took more than 60 seconds
20:53:24.830  ⚠ Restarted static page generation for /unauthorized because it took more than 60 seconds
20:53:25.032 Error: Event handlers cannot be passed to Client Component props.
20:53:25.033   {onUploadComplete: function onUploadComplete}
20:53:25.033                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:53:25.033 If you need interactivity, consider converting part of this to a Client Component.
20:53:25.033     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:53:25.034     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:53:25.034     at stringify (<anonymous>)
20:53:25.034     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:53:25.034     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:53:25.035     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
20:53:25.035     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
20:53:25.035     at listOnTimeout (node:internal/timers:588:17)
20:53:25.035     at process.processTimers (node:internal/timers:523:7) {
20:53:25.035   digest: '3943758011'
20:53:25.035 }
20:53:25.036 Error: Event handlers cannot be passed to Client Component props.
20:53:25.036   {onUploadComplete: function onUploadComplete}
20:53:25.036                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:53:25.036 If you need interactivity, consider converting part of this to a Client Component.
20:53:25.036     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:53:25.036     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:53:25.036     at stringify (<anonymous>)
20:53:25.036     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:53:25.036     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:53:25.036     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:53:25.036     at listOnTimeout (node:internal/timers:588:17)
20:53:25.036     at process.processTimers (node:internal/timers:523:7) {
20:53:25.036   digest: '988311795'
20:53:25.036 }
20:53:25.038 Error: Event handlers cannot be passed to Client Component props.
20:53:25.038   {onUploadComplete: function onUploadComplete}
20:53:25.038                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:53:25.038 If you need interactivity, consider converting part of this to a Client Component.
20:53:25.038     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:53:25.038     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:53:25.039     at stringify (<anonymous>)
20:53:25.039     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:53:25.039     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:53:25.039     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:53:25.039     at listOnTimeout (node:internal/timers:588:17)
20:53:25.039     at process.processTimers (node:internal/timers:523:7) {
20:53:25.039   digest: '988311795'
20:53:25.039 }
20:54:24.878  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
20:54:24.885  ⚠ Restarted static page generation for /admin/activities because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/contracts because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/dashboard because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/debug-quote because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/destinations/new because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/destinations because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/enquiries because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/offers because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/quotes because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/simple-quote because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/test-quote because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /admin/test-upload because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /auth/login because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /auth/pending because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /auth/register/confirmation because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /auth/register because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /auth/register/success because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /contract/sign because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /destinations/benidorm because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /destinations because it took more than 60 seconds
20:54:24.886  ⚠ Restarted static page generation for /enquiries/confirmation because it took more than 60 seconds
20:54:24.888  ⚠ Restarted static page generation for /enquiries because it took more than 60 seconds
20:54:24.888  ⚠ Restarted static page generation for /offers because it took more than 60 seconds
20:54:24.889  ⚠ Restarted static page generation for /packages because it took more than 60 seconds
20:54:24.889  ⚠ Restarted static page generation for / because it took more than 60 seconds
20:54:24.889  ⚠ Restarted static page generation for /training because it took more than 60 seconds
20:54:24.889  ⚠ Restarted static page generation for /unauthorized because it took more than 60 seconds
20:54:25.100 Error: Event handlers cannot be passed to Client Component props.
20:54:25.101   {onUploadComplete: function onUploadComplete}
20:54:25.101                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:54:25.101 If you need interactivity, consider converting part of this to a Client Component.
20:54:25.101     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:54:25.101     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:54:25.102     at stringify (<anonymous>)
20:54:25.102     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:54:25.102     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:54:25.102     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
20:54:25.102     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
20:54:25.103     at listOnTimeout (node:internal/timers:588:17)
20:54:25.103     at process.processTimers (node:internal/timers:523:7) {
20:54:25.103   digest: '3943758011'
20:54:25.103 }
20:54:25.103 Error: Event handlers cannot be passed to Client Component props.
20:54:25.103   {onUploadComplete: function onUploadComplete}
20:54:25.103                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:54:25.103 If you need interactivity, consider converting part of this to a Client Component.
20:54:25.103     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:54:25.103     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:54:25.103     at stringify (<anonymous>)
20:54:25.103     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:54:25.104     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:54:25.104     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:54:25.104     at listOnTimeout (node:internal/timers:588:17)
20:54:25.104     at process.processTimers (node:internal/timers:523:7) {
20:54:25.104   digest: '988311795'
20:54:25.104 }
20:54:25.104 Error: Event handlers cannot be passed to Client Component props.
20:54:25.105   {onUploadComplete: function onUploadComplete}
20:54:25.105                      ^^^^^^^^^^^^^^^^^^^^^^^^^
20:54:25.105 If you need interactivity, consider converting part of this to a Client Component.
20:54:25.105     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
20:54:25.105     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
20:54:25.105     at stringify (<anonymous>)
20:54:25.105     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
20:54:25.105     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
20:54:25.105     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
20:54:25.105     at listOnTimeout (node:internal/timers:588:17)
20:54:25.105     at process.processTimers (node:internal/timers:523:7) {
20:54:25.105   digest: '988311795'
20:54:25.105 }
20:55:24.951  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
20:55:24.964 
20:55:24.964 > Build error occurred
20:55:24.967 Error: Static page generation for /admin/activities is still timing out after 3 attempts. See more info here https://nextjs.org/docs/messages/static-page-generation-timeout
20:55:24.967     at onRestart (/vercel/path0/node_modules/next/dist/build/index.js:293:27)
20:55:24.967     at /vercel/path0/node_modules/next/dist/lib/worker.js:95:40
20:55:24.967     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
20:55:24.967     at async /vercel/path0/node_modules/next/dist/export/index.js:450:20
20:55:24.967     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
20:55:24.967     at async /vercel/path0/node_modules/next/dist/export/index.js:448:24
20:55:24.967     at async Promise.all (index 63)
20:55:24.967     at async exportAppImpl (/vercel/path0/node_modules/next/dist/export/index.js:440:21)
20:55:24.967     at async /vercel/path0/node_modules/next/dist/export/index.js:623:16
20:55:24.967     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
20:55:25.029 Error: Command "npm run build" exited with 1