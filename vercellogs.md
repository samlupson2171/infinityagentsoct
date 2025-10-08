12:49:42.708 Running build in Washington, D.C., USA (East) – iad1
12:49:42.708 Build machine configuration: 2 cores, 8 GB
12:49:42.723 Cloning github.com/samlupson2171/infinityagentsoct (Branch: main, Commit: f6695bb)
12:49:42.736 Skipping build cache, deployment was triggered without cache.
12:49:43.123 Cloning completed: 400.000ms
12:49:43.599 Running "vercel build"
12:49:43.994 Vercel CLI 48.2.4
12:49:44.380 Running "install" command: `npm install`...
12:49:48.070 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
12:49:49.118 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
12:49:49.774 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
12:49:51.058 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
12:49:51.160 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
12:49:51.816 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
12:49:56.035 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
12:50:07.530 
12:50:07.530 added 738 packages, and audited 739 packages in 23s
12:50:07.530 
12:50:07.531 196 packages are looking for funding
12:50:07.531   run `npm fund` for details
12:50:07.619 
12:50:07.621 6 vulnerabilities (1 low, 3 moderate, 1 high, 1 critical)
12:50:07.621 
12:50:07.621 To address issues that do not require attention, run:
12:50:07.622   npm audit fix
12:50:07.622 
12:50:07.622 To address all issues possible, run:
12:50:07.624   npm audit fix --force
12:50:07.624 
12:50:07.625 Some issues need review, and may require choosing
12:50:07.625 a different dependency.
12:50:07.626 
12:50:07.626 Run `npm audit` for details.
12:50:07.966 Detected Next.js version: 14.2.5
12:50:07.969 Running "npm run build"
12:50:08.099 
12:50:08.100 > infinity-weekends-website@0.1.0 build
12:50:08.100 > DISABLE_TINYMCE=true next build
12:50:08.100 
12:50:09.181 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:50:09.182 This information is used to shape Next.js' roadmap and prioritize features.
12:50:09.182 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:50:09.182 https://nextjs.org/telemetry
12:50:09.183 
12:50:09.247   ▲ Next.js 14.2.5
12:50:09.248 
12:50:09.312    Creating an optimized production build ...
12:50:14.227 request to https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap failed, reason: 
12:50:14.227 
12:50:14.228 Retrying 1/3...
12:50:38.035  ✓ Compiled successfully
12:50:38.037    Skipping validation of types
12:50:38.037    Skipping linting
12:50:38.359    Collecting page data ...
12:50:39.117 🔍 Validating environment configuration...
12:50:39.120 ❌ Environment validation failed
12:50:39.120 
12:50:39.121 🚨 Critical Issues:
12:50:39.121    NEXTAUTH_URL: Variable contains placeholder value - please update with actual value
12:50:39.121    NEXTAUTH_SECRET: Variable contains placeholder value - please update with actual value
12:50:39.121    MONGODB_URI: Contains potentially unsafe credential pattern
12:50:39.122    NEXTAUTH_SECRET: Contains potentially unsafe credential pattern
12:50:39.126 
12:50:39.126 📖 For setup instructions, see LAUNCH_GUIDE.md or run: node check-env.js
12:50:39.183 (node:339) [MONGOOSE] Warning: Duplicate schema index on {"version":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
12:50:39.183 (Use `node --trace-warnings ...` to show where the warning was created)
12:50:39.350 (node:339) [MONGOOSE] Warning: Duplicate schema index on {"timestamp":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
12:50:39.436 (node:339) [MONGOOSE] Warning: Duplicate schema index on {"key":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
12:50:39.455 (node:339) [MONGOOSE] Warning: Duplicate schema index on {"associatedMaterial":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
12:50:42.006    Generating static pages (0/90) ...
12:50:43.319 Error fetching agencies: q [Error]: Dynamic server usage: Route /api/admin/agencies couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.322     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:43.323     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:43.323     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:43.323     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:43.323     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:43.323     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:43.324     at p (/vercel/path0/.next/server/app/api/admin/agencies/route.js:1:873)
12:50:43.324     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.324     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.324     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:43.325   description: "Route /api/admin/agencies couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.325   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.325 }
12:50:43.389 Error fetching agency stats: q [Error]: Dynamic server usage: Route /api/admin/agencies/stats couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.391     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:43.394     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:43.395     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:43.395     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:43.395     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:43.395     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:43.395     at p (/vercel/path0/.next/server/app/api/admin/agencies/stats/route.js:1:873)
12:50:43.395     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.396     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.396     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:43.397   description: "Route /api/admin/agencies/stats couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.397   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.398 }
12:50:43.467 Error fetching contract signatures: n [Error]: Dynamic server usage: Route /api/admin/contracts/signatures couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.468     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:43.468     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:43.471     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:43.471     at m (/vercel/path0/.next/server/app/api/admin/contracts/signatures/route.js:1:1363)
12:50:43.471     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.472     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.472     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:43.472     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:43.472     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:43.473     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:43.473   description: "Route /api/admin/contracts/signatures couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.473   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.473 }
12:50:43.639 Error fetching destination activity: n [Error]: Dynamic server usage: Route /api/admin/destinations/activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.644     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:43.644     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:43.644     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:43.644     at m (/vercel/path0/.next/server/app/api/admin/destinations/activity/route.js:1:1355)
12:50:43.644     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.644     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.644     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:43.644     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:43.651     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:43.652     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:43.653   description: "Route /api/admin/destinations/activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.653   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.653 }
12:50:43.825 Error fetching pending approvals: n [Error]: Dynamic server usage: Route /api/admin/destinations/pending-approval couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.825     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:43.825     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:43.825     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:43.825     at l (/vercel/path0/.next/server/app/api/admin/destinations/pending-approval/route.js:1:1353)
12:50:43.825     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.825     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.825     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:43.825     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:43.825     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:43.826     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:43.826   description: "Route /api/admin/destinations/pending-approval couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.826   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.826 }
12:50:43.978 Error fetching destination stats: n [Error]: Dynamic server usage: Route /api/admin/destinations/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:43.979     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:43.979     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:43.979     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:43.979     at m (/vercel/path0/.next/server/app/api/admin/destinations/stats/route.js:1:1354)
12:50:43.980     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:43.980     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:43.980     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:43.980     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:43.981     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:43.981     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:43.981   description: "Route /api/admin/destinations/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:43.981   digest: 'DYNAMIC_SERVER_USAGE'
12:50:43.981 }
12:50:44.034 Error validating slug: n [Error]: Dynamic server usage: Route /api/admin/destinations/validate-slug couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:44.035     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:44.035     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:44.035     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:44.035     at l (/vercel/path0/.next/server/app/api/admin/destinations/validate-slug/route.js:1:1352)
12:50:44.035     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:44.035     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:44.035     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:44.035     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:44.035     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:44.035     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:44.035   description: "Route /api/admin/destinations/validate-slug couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:44.035   digest: 'DYNAMIC_SERVER_USAGE'
12:50:44.035 }
12:50:44.205    Generating static pages (22/90) 
12:50:44.206 MongoServerSelectionError: connection <monitor> to 65.62.36.126:27017 closed
12:50:44.206     at Timeout._onTimeout (/vercel/path0/node_modules/mongodb/lib/sdam/topology.js:278:38)
12:50:44.206     at listOnTimeout (node:internal/timers:588:17)
12:50:44.206     at process.processTimers (node:internal/timers:523:7) {
12:50:44.207   reason: TopologyDescription {
12:50:44.207     type: 'ReplicaSetNoPrimary',
12:50:44.207     servers: Map(3) {
12:50:44.207       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:44.207       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:44.208       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:44.208     },
12:50:44.208     stale: false,
12:50:44.208     compatible: true,
12:50:44.208     heartbeatFrequencyMS: 10000,
12:50:44.208     localThresholdMS: 15,
12:50:44.209     setName: 'atlas-ez1tb1-shard-0',
12:50:44.209     maxElectionId: null,
12:50:44.209     maxSetVersion: null,
12:50:44.209     commonWireVersion: 0,
12:50:44.209     logicalSessionTimeoutMinutes: null
12:50:44.210   },
12:50:44.210   code: undefined,
12:50:44.210   [Symbol(errorLabels)]: Set(0) {}
12:50:44.210 }
12:50:44.648 Error fetching booking analytics: q [Error]: Dynamic server usage: Route /api/admin/quotes/booking-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:44.649     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:44.649     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:44.649     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:44.649     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:44.649     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:44.650     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:44.650     at c (/vercel/path0/.next/server/app/api/admin/quotes/booking-analytics/route.js:1:868)
12:50:44.650     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:44.650     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:44.650     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:44.650   description: "Route /api/admin/quotes/booking-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:44.650   digest: 'DYNAMIC_SERVER_USAGE'
12:50:44.650 }
12:50:44.848 Error fetching email analytics: q [Error]: Dynamic server usage: Route /api/admin/quotes/email-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:44.848     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:44.849     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:44.853     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:44.853     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:44.853     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:44.853     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:44.853     at m (/vercel/path0/.next/server/app/api/admin/quotes/email-analytics/route.js:1:868)
12:50:44.853     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:44.853     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:44.853     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:44.853   description: "Route /api/admin/quotes/email-analytics couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:44.853   digest: 'DYNAMIC_SERVER_USAGE'
12:50:44.853 }
12:50:44.956 Quote auth middleware error: q [Error]: Dynamic server usage: Route /api/admin/quotes/export couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:44.956     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:44.956     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:44.956     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:44.959     at n (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:9830)
12:50:44.960     at u (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:10959)
12:50:44.960     at c (/vercel/path0/.next/server/app/api/admin/quotes/[id]/route.js:1:11046)
12:50:44.960     at p (/vercel/path0/.next/server/app/api/admin/quotes/export/route.js:1:1046)
12:50:44.960     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:44.960     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:44.960     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:44.960   description: "Route /api/admin/quotes/export couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:44.960   digest: 'DYNAMIC_SERVER_USAGE'
12:50:44.960 }
12:50:44.960 Quote export error: Response {
12:50:44.960   status: 500,
12:50:44.960   statusText: '',
12:50:44.961   headers: Headers { 'content-type': 'application/json' },
12:50:44.961   body: ReadableStream { locked: false, state: 'readable', supportsBYOB: true },
12:50:44.961   bodyUsed: false,
12:50:44.961   ok: false,
12:50:44.961   redirected: false,
12:50:44.961   type: 'default',
12:50:44.961   url: ''
12:50:44.961 }
12:50:45.179 Quote search error: n [Error]: Dynamic server usage: Route /api/admin/quotes/search couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:45.179     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:45.179     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:45.179     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:45.179     at l (/vercel/path0/.next/server/app/api/admin/quotes/search/route.js:1:1355)
12:50:45.179     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:45.179     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:45.179     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:45.179     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:45.179     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:45.180     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:45.180   description: "Route /api/admin/quotes/search couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:45.180   digest: 'DYNAMIC_SERVER_USAGE'
12:50:45.180 }
12:50:45.205 Quote stats error: n [Error]: Dynamic server usage: Route /api/admin/quotes/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:45.205     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:45.206     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:45.206     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:45.206     at p (/vercel/path0/.next/server/app/api/admin/quotes/stats/route.js:1:1355)
12:50:45.206     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:45.206     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:45.206     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:45.206     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:45.206     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:45.206     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:45.206   description: "Route /api/admin/quotes/stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:45.206   digest: 'DYNAMIC_SERVER_USAGE'
12:50:45.206 }
12:50:45.328 Data integrity API error: q [Error]: Dynamic server usage: Route /api/admin/system/data-integrity couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:45.329     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:45.329     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:45.329     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:45.329     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:45.329     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:45.330     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:45.330     at h (/vercel/path0/.next/server/app/api/admin/system/data-integrity/route.js:9:138)
12:50:45.330     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:45.330     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:45.330     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:45.330   description: "Route /api/admin/system/data-integrity couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:45.331   digest: 'DYNAMIC_SERVER_USAGE'
12:50:45.331 }
12:50:45.345 Download analytics error: n [Error]: Dynamic server usage: Route /api/admin/training/analytics/downloads couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:45.345     at l (/vercel/path0/.next/server/chunks/8948.js:1:37249)
12:50:45.345     at d (/vercel/path0/.next/server/chunks/6900.js:30:25624)
12:50:45.346     at a (/vercel/path0/.next/server/chunks/6900.js:30:18613)
12:50:45.346     at u (/vercel/path0/.next/server/app/api/admin/training/analytics/downloads/route.js:1:1344)
12:50:45.346     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:45.346     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:45.346     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:50:45.346     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:50:45.346     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:50:45.347     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:50:45.347   description: "Route /api/admin/training/analytics/downloads couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:45.347   digest: 'DYNAMIC_SERVER_USAGE'
12:50:45.347 }
12:50:45.451    Generating static pages (44/90) 
12:50:45.521 Error fetching pending users: q [Error]: Dynamic server usage: Route /api/admin/users/pending couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:50:45.522     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:50:45.522     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:50:45.522     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:50:45.522     at i (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:10655)
12:50:45.523     at o (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11138)
12:50:45.523     at n (/vercel/path0/.next/server/app/api/admin/activities/upload/route.js:1:11342)
12:50:45.523     at p (/vercel/path0/.next/server/app/api/admin/users/pending/route.js:1:873)
12:50:45.523     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:50:45.523     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:50:45.523     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062) {
12:50:45.523   description: "Route /api/admin/users/pending couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:50:45.524   digest: 'DYNAMIC_SERVER_USAGE'
12:50:45.524 }
12:50:50.881 Mongoose disconnected from MongoDB
12:50:50.881 MongoDB connection error: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
12:50:50.882     at _handleConnectionErrors (/vercel/path0/node_modules/mongoose/lib/connection.js:1165:11)
12:50:50.882     at NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1096:11)
12:50:50.882     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:50:50.882     at async d (/vercel/path0/.next/server/app/api/contract/current/route.js:1:579)
12:50:50.882     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
12:50:50.883     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
12:50:50.883     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
12:50:50.883     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
12:50:50.883     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
12:50:50.883     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20) {
12:50:50.884   errorLabelSet: Set(0) {},
12:50:50.884   reason: TopologyDescription {
12:50:50.884     type: 'ReplicaSetNoPrimary',
12:50:50.884     servers: Map(3) {
12:50:50.884       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.885       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.885       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:50.885     },
12:50:50.885     stale: false,
12:50:50.885     compatible: true,
12:50:50.886     heartbeatFrequencyMS: 10000,
12:50:50.886     localThresholdMS: 15,
12:50:50.886     setName: 'atlas-ez1tb1-shard-0',
12:50:50.886     maxElectionId: null,
12:50:50.886     maxSetVersion: null,
12:50:50.886     commonWireVersion: 0,
12:50:50.887     logicalSessionTimeoutMinutes: null
12:50:50.887   },
12:50:50.887   code: undefined,
12:50:50.887   cause: TopologyDescription {
12:50:50.887     type: 'ReplicaSetNoPrimary',
12:50:50.887     servers: Map(3) {
12:50:50.887       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.887       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.887       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:50.887     },
12:50:50.887     stale: false,
12:50:50.887     compatible: true,
12:50:50.888     heartbeatFrequencyMS: 10000,
12:50:50.888     localThresholdMS: 15,
12:50:50.888     setName: 'atlas-ez1tb1-shard-0',
12:50:50.888     maxElectionId: null,
12:50:50.888     maxSetVersion: null,
12:50:50.888     commonWireVersion: 0,
12:50:50.888     logicalSessionTimeoutMinutes: null
12:50:50.888   }
12:50:50.888 }
12:50:50.888 Error fetching current contract: Error: Failed to connect to MongoDB: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
12:50:50.888     at l (/vercel/path0/.next/server/chunks/4184.js:1:948)
12:50:50.888     at async d (/vercel/path0/.next/server/app/api/contract/current/route.js:1:579)
12:50:50.888     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
12:50:50.890     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
12:50:50.890     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
12:50:50.890     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
12:50:50.890     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
12:50:50.891     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
12:50:50.891     at async Object.exportPage (/vercel/path0/node_modules/next/dist/export/worker.js:236:20)
12:50:50.892 Mongoose connection error: MongoServerSelectionError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:50.892 
12:50:50.892     at Topology.selectServer (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:326:38)
12:50:50.892     at async Topology._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:200:28)
12:50:50.892     at async Topology.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:152:13)
12:50:50.892     at async topologyConnect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:258:17)
12:50:50.893     at async MongoClient._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:271:13)
12:50:50.893     at async MongoClient.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:196:13)
12:50:50.893     at async NativeConnection.createClient (/vercel/path0/node_modules/mongoose/lib/drivers/node-mongodb-native/connection.js:351:3)
12:50:50.893     at async NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1094:5)
12:50:50.893     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:50:50.893     at async d (/vercel/path0/.next/server/app/api/contract/current/route.js:1:579) {
12:50:50.893   errorLabelSet: Set(0) {},
12:50:50.894   reason: TopologyDescription {
12:50:50.894     type: 'ReplicaSetNoPrimary',
12:50:50.894     servers: Map(3) {
12:50:50.894       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.894       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:50.894       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:50.894     },
12:50:50.895     stale: false,
12:50:50.895     compatible: true,
12:50:50.895     heartbeatFrequencyMS: 10000,
12:50:50.895     localThresholdMS: 15,
12:50:50.895     setName: 'atlas-ez1tb1-shard-0',
12:50:50.895     maxElectionId: null,
12:50:50.895     maxSetVersion: null,
12:50:50.895     commonWireVersion: 0,
12:50:50.896     logicalSessionTimeoutMinutes: null
12:50:50.896   },
12:50:50.896   code: undefined,
12:50:50.896   [cause]: MongoNetworkError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:50.896   
12:50:50.896       at TLSSocket.<anonymous> (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/cmap/connect.js:286:44)
12:50:50.896       at Object.onceWrapper (node:events:634:26)
12:50:50.897       at TLSSocket.emit (node:events:519:28)
12:50:50.897       at emitErrorNT (node:internal/streams/destroy:170:8)
12:50:50.897       at emitErrorCloseNT (node:internal/streams/destroy:129:3)
12:50:50.897       at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
12:50:50.897     errorLabelSet: Set(1) { 'ResetPool' },
12:50:50.898     beforeHandshake: false,
12:50:50.898     [cause]: [Error: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:50.898     ] {
12:50:50.898       library: 'SSL routines',
12:50:50.898       reason: 'tlsv1 alert internal error',
12:50:50.899       code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
12:50:50.899     }
12:50:50.899   }
12:50:50.899 }
12:50:56.055 Mongoose disconnected from MongoDB
12:50:56.057 MongoDB connection error: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
12:50:56.057     at _handleConnectionErrors (/vercel/path0/node_modules/mongoose/lib/connection.js:1165:11)
12:50:56.057     at NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1096:11)
12:50:56.058     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:50:56.058     at async p (/vercel/path0/.next/server/app/api/destinations/route.js:1:579)
12:50:56.058     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
12:50:56.059     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
12:50:56.059     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
12:50:56.059     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
12:50:56.059     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
12:50:56.060     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20) {
12:50:56.060   errorLabelSet: Set(0) {},
12:50:56.060   reason: TopologyDescription {
12:50:56.060     type: 'ReplicaSetNoPrimary',
12:50:56.060     servers: Map(3) {
12:50:56.060       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.062       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.062       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:56.062     },
12:50:56.062     stale: false,
12:50:56.063     compatible: true,
12:50:56.063     heartbeatFrequencyMS: 10000,
12:50:56.063     localThresholdMS: 15,
12:50:56.066     setName: 'atlas-ez1tb1-shard-0',
12:50:56.070     maxElectionId: null,
12:50:56.070     maxSetVersion: null,
12:50:56.073     commonWireVersion: 0,
12:50:56.073     logicalSessionTimeoutMinutes: null
12:50:56.074   },
12:50:56.074   code: undefined,
12:50:56.074   cause: TopologyDescription {
12:50:56.074     type: 'ReplicaSetNoPrimary',
12:50:56.074     servers: Map(3) {
12:50:56.074       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.075       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.075       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:56.075     },
12:50:56.075     stale: false,
12:50:56.075     compatible: true,
12:50:56.075     heartbeatFrequencyMS: 10000,
12:50:56.076     localThresholdMS: 15,
12:50:56.076     setName: 'atlas-ez1tb1-shard-0',
12:50:56.076     maxElectionId: null,
12:50:56.078     maxSetVersion: null,
12:50:56.078     commonWireVersion: 0,
12:50:56.078     logicalSessionTimeoutMinutes: null
12:50:56.082   }
12:50:56.084 }
12:50:56.084 Error fetching destinations: Error: Failed to connect to MongoDB: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
12:50:56.084     at l (/vercel/path0/.next/server/chunks/4184.js:1:948)
12:50:56.084     at async p (/vercel/path0/.next/server/app/api/destinations/route.js:1:579)
12:50:56.084     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
12:50:56.084     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
12:50:56.084     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
12:50:56.084     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
12:50:56.085     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
12:50:56.085     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
12:50:56.085     at async Object.exportPage (/vercel/path0/node_modules/next/dist/export/worker.js:236:20)
12:50:56.085 Mongoose connection error: MongoServerSelectionError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:56.085 
12:50:56.085     at Topology.selectServer (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:326:38)
12:50:56.085     at async Topology._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:200:28)
12:50:56.085     at async Topology.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:152:13)
12:50:56.085     at async topologyConnect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:258:17)
12:50:56.085     at async MongoClient._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:271:13)
12:50:56.085     at async MongoClient.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:196:13)
12:50:56.085     at async NativeConnection.createClient (/vercel/path0/node_modules/mongoose/lib/drivers/node-mongodb-native/connection.js:351:3)
12:50:56.085     at async NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1094:5)
12:50:56.085     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:50:56.085     at async p (/vercel/path0/.next/server/app/api/destinations/route.js:1:579) {
12:50:56.085   errorLabelSet: Set(0) {},
12:50:56.085   reason: TopologyDescription {
12:50:56.085     type: 'ReplicaSetNoPrimary',
12:50:56.085     servers: Map(3) {
12:50:56.085       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.085       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:50:56.085       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:50:56.085     },
12:50:56.086     stale: false,
12:50:56.086     compatible: true,
12:50:56.086     heartbeatFrequencyMS: 10000,
12:50:56.086     localThresholdMS: 15,
12:50:56.086     setName: 'atlas-ez1tb1-shard-0',
12:50:56.086     maxElectionId: null,
12:50:56.086     maxSetVersion: null,
12:50:56.086     commonWireVersion: 0,
12:50:56.086     logicalSessionTimeoutMinutes: null
12:50:56.086   },
12:50:56.086   code: undefined,
12:50:56.086   [cause]: MongoNetworkError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:56.086   
12:50:56.086       at TLSSocket.<anonymous> (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/cmap/connect.js:286:44)
12:50:56.086       at Object.onceWrapper (node:events:634:26)
12:50:56.086       at TLSSocket.emit (node:events:519:28)
12:50:56.086       at emitErrorNT (node:internal/streams/destroy:170:8)
12:50:56.086       at emitErrorCloseNT (node:internal/streams/destroy:129:3)
12:50:56.086       at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
12:50:56.086     errorLabelSet: Set(1) { 'ResetPool' },
12:50:56.086     beforeHandshake: false,
12:50:56.086     [cause]: [Error: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:50:56.086     ] {
12:50:56.087       library: 'SSL routines',
12:50:56.087       reason: 'tlsv1 alert internal error',
12:50:56.087       code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
12:50:56.087     }
12:50:56.087   }
12:50:56.087 }
12:50:56.087 
12:50:56.088 ⚠️  Application starting with configuration issues.
12:50:56.088 Some features may not work correctly until these are resolved.
12:51:01.074 Mongoose disconnected from MongoDB
12:51:01.075 MongoDB connection error: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
12:51:01.075     at _handleConnectionErrors (/vercel/path0/node_modules/mongoose/lib/connection.js:1165:11)
12:51:01.075     at NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1096:11)
12:51:01.075     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:51:01.075     at async p (/vercel/path0/.next/server/app/api/health/route.js:1:691)
12:51:01.075     at async /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36258
12:51:01.075     at async eR.execute (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:26874)
12:51:01.075     at async eR.handle (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37512)
12:51:01.075     at async exportAppRoute (/vercel/path0/node_modules/next/dist/export/routes/app-route.js:77:26)
12:51:01.075     at async exportPageImpl (/vercel/path0/node_modules/next/dist/export/worker.js:175:20)
12:51:01.076     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20) {
12:51:01.076   errorLabelSet: Set(0) {},
12:51:01.076   reason: TopologyDescription {
12:51:01.076     type: 'ReplicaSetNoPrimary',
12:51:01.076     servers: Map(3) {
12:51:01.076       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.076       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.076       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:51:01.076     },
12:51:01.076     stale: false,
12:51:01.076     compatible: true,
12:51:01.076     heartbeatFrequencyMS: 10000,
12:51:01.076     localThresholdMS: 15,
12:51:01.076     setName: 'atlas-ez1tb1-shard-0',
12:51:01.076     maxElectionId: null,
12:51:01.076     maxSetVersion: null,
12:51:01.076     commonWireVersion: 0,
12:51:01.076     logicalSessionTimeoutMinutes: null
12:51:01.076   },
12:51:01.076   code: undefined,
12:51:01.076   cause: TopologyDescription {
12:51:01.076     type: 'ReplicaSetNoPrimary',
12:51:01.076     servers: Map(3) {
12:51:01.076       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.076       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.076       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:51:01.076     },
12:51:01.076     stale: false,
12:51:01.076     compatible: true,
12:51:01.076     heartbeatFrequencyMS: 10000,
12:51:01.076     localThresholdMS: 15,
12:51:01.076     setName: 'atlas-ez1tb1-shard-0',
12:51:01.076     maxElectionId: null,
12:51:01.076     maxSetVersion: null,
12:51:01.076     commonWireVersion: 0,
12:51:01.077     logicalSessionTimeoutMinutes: null
12:51:01.077   }
12:51:01.077 }
12:51:01.077 Mongoose connection error: MongoServerSelectionError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:51:01.077 
12:51:01.077     at Topology.selectServer (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:326:38)
12:51:01.077     at async Topology._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:200:28)
12:51:01.077     at async Topology.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/sdam/topology.js:152:13)
12:51:01.077     at async topologyConnect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:258:17)
12:51:01.077     at async MongoClient._connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:271:13)
12:51:01.077     at async MongoClient.connect (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/mongo_client.js:196:13)
12:51:01.077     at async NativeConnection.createClient (/vercel/path0/node_modules/mongoose/lib/drivers/node-mongodb-native/connection.js:351:3)
12:51:01.077     at async NativeConnection.openUri (/vercel/path0/node_modules/mongoose/lib/connection.js:1094:5)
12:51:01.077     at async l (/vercel/path0/.next/server/chunks/4184.js:1:804)
12:51:01.077     at async p (/vercel/path0/.next/server/app/api/health/route.js:1:691) {
12:51:01.077   errorLabelSet: Set(0) {},
12:51:01.077   reason: TopologyDescription {
12:51:01.077     type: 'ReplicaSetNoPrimary',
12:51:01.077     servers: Map(3) {
12:51:01.077       'ac-2xppepz-shard-00-01.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.077       'ac-2xppepz-shard-00-02.1pgp6zc.mongodb.net:27017' => [ServerDescription],
12:51:01.077       'ac-2xppepz-shard-00-00.1pgp6zc.mongodb.net:27017' => [ServerDescription]
12:51:01.077     },
12:51:01.077     stale: false,
12:51:01.077     compatible: true,
12:51:01.077     heartbeatFrequencyMS: 10000,
12:51:01.077     localThresholdMS: 15,
12:51:01.077     setName: 'atlas-ez1tb1-shard-0',
12:51:01.078     maxElectionId: null,
12:51:01.078     maxSetVersion: null,
12:51:01.078     commonWireVersion: 0,
12:51:01.078     logicalSessionTimeoutMinutes: null
12:51:01.079   },
12:51:01.079   code: undefined,
12:51:01.079   [cause]: MongoNetworkError: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:51:01.079   
12:51:01.079       at TLSSocket.<anonymous> (/vercel/path0/node_modules/mongoose/node_modules/mongodb/lib/cmap/connect.js:286:44)
12:51:01.079       at Object.onceWrapper (node:events:634:26)
12:51:01.079       at TLSSocket.emit (node:events:519:28)
12:51:01.080       at emitErrorNT (node:internal/streams/destroy:170:8)
12:51:01.080       at emitErrorCloseNT (node:internal/streams/destroy:129:3)
12:51:01.080       at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
12:51:01.080     errorLabelSet: Set(1) { 'ResetPool' },
12:51:01.080     beforeHandshake: false,
12:51:01.080     [cause]: [Error: 80D8DC457A7F0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:../deps/openssl/openssl/ssl/record/rec_layer_s3.c:916:SSL alert number 80
12:51:01.080     ] {
12:51:01.080       library: 'SSL routines',
12:51:01.081       reason: 'tlsv1 alert internal error',
12:51:01.081       code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
12:51:01.081     }
12:51:01.081   }
12:51:01.081 }
12:51:01.081 Error fetching offers: q [Error]: Dynamic server usage: Route /api/offers couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:51:01.081     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:51:01.081     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:51:01.082     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:51:01.082     at d (/vercel/path0/.next/server/app/api/offers/route.js:1:880)
12:51:01.082     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:51:01.082     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:51:01.082     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:51:01.082     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:51:01.082     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:51:01.082     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:51:01.082   description: "Route /api/offers couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:51:01.082   digest: 'DYNAMIC_SERVER_USAGE'
12:51:01.082 }
12:51:01.091 Error fetching training materials: q [Error]: Dynamic server usage: Route /api/training couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
12:51:01.092     at W (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21106)
12:51:01.092     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:28459)
12:51:01.092     at f (/vercel/path0/.next/server/chunks/330.js:1:97296)
12:51:01.092     at c (/vercel/path0/.next/server/app/api/training/route.js:1:884)
12:51:01.093     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36264
12:51:01.093     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
12:51:01.093     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
12:51:01.093     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
12:51:01.093     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
12:51:01.094     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
12:51:01.094   description: "Route /api/training couldn't be rendered statically because it used `request.cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
12:51:01.094   digest: 'DYNAMIC_SERVER_USAGE'
12:51:01.094 }
12:51:01.167 Error: Event handlers cannot be passed to Client Component props.
12:51:01.168   {onUploadComplete: function onUploadComplete}
12:51:01.168                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:51:01.168 If you need interactivity, consider converting part of this to a Client Component.
12:51:01.168     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:51:01.168     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:51:01.168     at stringify (<anonymous>)
12:51:01.168     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:51:01.168     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:51:01.169     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
12:51:01.169     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
12:51:01.169     at listOnTimeout (node:internal/timers:588:17)
12:51:01.169     at process.processTimers (node:internal/timers:523:7) {
12:51:01.169   digest: '3943758011'
12:51:01.169 }
12:51:01.169 Error: Event handlers cannot be passed to Client Component props.
12:51:01.169   {onUploadComplete: function onUploadComplete}
12:51:01.169                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:51:01.169 If you need interactivity, consider converting part of this to a Client Component.
12:51:01.169     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:51:01.169     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:51:01.169     at stringify (<anonymous>)
12:51:01.169     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:51:01.170     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:51:01.170     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:51:01.170     at listOnTimeout (node:internal/timers:588:17)
12:51:01.170     at process.processTimers (node:internal/timers:523:7) {
12:51:01.170   digest: '988311795'
12:51:01.170 }
12:51:01.171 Error: Event handlers cannot be passed to Client Component props.
12:51:01.171   {onUploadComplete: function onUploadComplete}
12:51:01.171                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:51:01.171 If you need interactivity, consider converting part of this to a Client Component.
12:51:01.171     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:51:01.171     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:51:01.171     at stringify (<anonymous>)
12:51:01.171     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:51:01.171     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:51:01.171     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:51:01.171     at listOnTimeout (node:internal/timers:588:17)
12:51:01.171     at process.processTimers (node:internal/timers:523:7) {
12:51:01.171   digest: '988311795'
12:51:01.171 }
12:52:01.181  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
12:52:01.199  ⚠ Restarted static page generation for /admin/activities because it took more than 60 seconds
12:52:01.200  ⚠ See more info here https://nextjs.org/docs/messages/static-page-generation-timeout
12:52:01.201  ⚠ Restarted static page generation for /admin/contracts because it took more than 60 seconds
12:52:01.201  ⚠ Restarted static page generation for /admin/dashboard because it took more than 60 seconds
12:52:01.202  ⚠ Restarted static page generation for /admin/debug-quote because it took more than 60 seconds
12:52:01.202  ⚠ Restarted static page generation for /admin/destinations/new because it took more than 60 seconds
12:52:01.202  ⚠ Restarted static page generation for /admin/destinations because it took more than 60 seconds
12:52:01.202  ⚠ Restarted static page generation for /admin/enquiries because it took more than 60 seconds
12:52:01.202  ⚠ Restarted static page generation for /admin/offers because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /admin/quotes because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /admin/simple-quote because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /admin/test-quote because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /admin/test-upload because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /auth/login because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /auth/pending because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /auth/register/confirmation because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /auth/register because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /auth/register/success because it took more than 60 seconds
12:52:01.203  ⚠ Restarted static page generation for /contract/sign because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /destinations/benidorm because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /destinations because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /enquiries/confirmation because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /enquiries because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /offers because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /packages because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for / because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /training because it took more than 60 seconds
12:52:01.204  ⚠ Restarted static page generation for /unauthorized because it took more than 60 seconds
12:52:01.441 Error: Event handlers cannot be passed to Client Component props.
12:52:01.445   {onUploadComplete: function onUploadComplete}
12:52:01.445                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:52:01.445 If you need interactivity, consider converting part of this to a Client Component.
12:52:01.445     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:52:01.445     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:52:01.445     at stringify (<anonymous>)
12:52:01.445     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:52:01.445     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:52:01.445     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
12:52:01.445     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
12:52:01.445     at listOnTimeout (node:internal/timers:588:17)
12:52:01.445     at process.processTimers (node:internal/timers:523:7) {
12:52:01.445   digest: '3943758011'
12:52:01.445 }
12:52:01.446 Error: Event handlers cannot be passed to Client Component props.
12:52:01.446   {onUploadComplete: function onUploadComplete}
12:52:01.446                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:52:01.446 If you need interactivity, consider converting part of this to a Client Component.
12:52:01.447     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:52:01.447     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:52:01.447     at stringify (<anonymous>)
12:52:01.447     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:52:01.448     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:52:01.448     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:52:01.448     at listOnTimeout (node:internal/timers:588:17)
12:52:01.448     at process.processTimers (node:internal/timers:523:7) {
12:52:01.448   digest: '988311795'
12:52:01.448 }
12:52:01.450 Error: Event handlers cannot be passed to Client Component props.
12:52:01.453   {onUploadComplete: function onUploadComplete}
12:52:01.453                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:52:01.453 If you need interactivity, consider converting part of this to a Client Component.
12:52:01.454     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:52:01.454     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:52:01.454     at stringify (<anonymous>)
12:52:01.454     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:52:01.454     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:52:01.454     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:52:01.454     at listOnTimeout (node:internal/timers:588:17)
12:52:01.455     at process.processTimers (node:internal/timers:523:7) {
12:52:01.455   digest: '988311795'
12:52:01.455 }
12:53:01.244  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
12:53:01.248  ⚠ Restarted static page generation for /admin/activities because it took more than 60 seconds
12:53:01.248  ⚠ Restarted static page generation for /admin/contracts because it took more than 60 seconds
12:53:01.248  ⚠ Restarted static page generation for /admin/dashboard because it took more than 60 seconds
12:53:01.248  ⚠ Restarted static page generation for /admin/debug-quote because it took more than 60 seconds
12:53:01.248  ⚠ Restarted static page generation for /admin/destinations/new because it took more than 60 seconds
12:53:01.248  ⚠ Restarted static page generation for /admin/destinations because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/enquiries because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/offers because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/quotes because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/simple-quote because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/test-quote because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /admin/test-upload because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /auth/login because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /auth/pending because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /auth/register/confirmation because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /auth/register because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /auth/register/success because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /contract/sign because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /destinations/benidorm because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /destinations because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /enquiries/confirmation because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /enquiries because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /offers because it took more than 60 seconds
12:53:01.249  ⚠ Restarted static page generation for /packages because it took more than 60 seconds
12:53:01.250  ⚠ Restarted static page generation for / because it took more than 60 seconds
12:53:01.250  ⚠ Restarted static page generation for /training because it took more than 60 seconds
12:53:01.250  ⚠ Restarted static page generation for /unauthorized because it took more than 60 seconds
12:53:01.467 Error: Event handlers cannot be passed to Client Component props.
12:53:01.468   {onUploadComplete: function onUploadComplete}
12:53:01.468                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:53:01.468 If you need interactivity, consider converting part of this to a Client Component.
12:53:01.468     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:53:01.469     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:53:01.469     at stringify (<anonymous>)
12:53:01.469     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:53:01.469     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:53:01.470     at AsyncLocalStorage.run (node:internal/async_local_storage/async_hooks:91:14)
12:53:01.470     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150397)
12:53:01.470     at listOnTimeout (node:internal/timers:588:17)
12:53:01.470     at process.processTimers (node:internal/timers:523:7) {
12:53:01.471   digest: '3943758011'
12:53:01.471 }
12:53:01.471 Error: Event handlers cannot be passed to Client Component props.
12:53:01.471   {onUploadComplete: function onUploadComplete}
12:53:01.471                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:53:01.471 If you need interactivity, consider converting part of this to a Client Component.
12:53:01.471     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:53:01.471     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:53:01.471     at stringify (<anonymous>)
12:53:01.471     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:53:01.471     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:53:01.472     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:53:01.472     at listOnTimeout (node:internal/timers:588:17)
12:53:01.472     at process.processTimers (node:internal/timers:523:7) {
12:53:01.472   digest: '988311795'
12:53:01.472 }
12:53:01.472 Error: Event handlers cannot be passed to Client Component props.
12:53:01.472   {onUploadComplete: function onUploadComplete}
12:53:01.472                      ^^^^^^^^^^^^^^^^^^^^^^^^^
12:53:01.472 If you need interactivity, consider converting part of this to a Client Component.
12:53:01.472     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:140566)
12:53:01.472     at Object.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135755)
12:53:01.472     at stringify (<anonymous>)
12:53:01.472     at eR (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142219)
12:53:01.472     at eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142698)
12:53:01.472     at Timeout._onTimeout (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135475)
12:53:01.472     at listOnTimeout (node:internal/timers:588:17)
12:53:01.472     at process.processTimers (node:internal/timers:523:7) {
12:53:01.472   digest: '988311795'
12:53:01.472 }
12:54:01.278  ⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds. Subsequent errors may be a result of the worker exiting.
12:54:01.292 
12:54:01.292 > Build error occurred
12:54:01.294 Error: Static page generation for /admin/activities is still timing out after 3 attempts. See more info here https://nextjs.org/docs/messages/static-page-generation-timeout
12:54:01.295     at onRestart (/vercel/path0/node_modules/next/dist/build/index.js:293:27)
12:54:01.295     at /vercel/path0/node_modules/next/dist/lib/worker.js:95:40
12:54:01.295     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
12:54:01.295     at async /vercel/path0/node_modules/next/dist/export/index.js:450:20
12:54:01.295     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
12:54:01.295     at async /vercel/path0/node_modules/next/dist/export/index.js:448:24
12:54:01.295     at async Promise.all (index 63)
12:54:01.295     at async exportAppImpl (/vercel/path0/node_modules/next/dist/export/index.js:440:21)
12:54:01.295     at async /vercel/path0/node_modules/next/dist/export/index.js:623:16
12:54:01.295     at async Span.traceAsyncFn (/vercel/path0/node_modules/next/dist/trace/trace.js:154:20)
12:54:01.358 Error: Command "npm run build" exited with 1