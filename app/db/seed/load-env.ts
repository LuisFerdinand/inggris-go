// app/db/seed/load-env.ts
//
// Side-effect-only module: loads .env.local before any other import in a
// seed entrypoint runs. Import this FIRST (as the very first `import`
// statement) in any standalone `tsx app/db/seed/*.single.ts` script —
// ES module import ordering evaluates imports in declaration order, so
// this must come before imports that transitively touch app/db/db.ts.

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
