import { withClient } from "@/core/orm/withClient.ts";
import { db } from "@/core/orm/Db.ts";
import { compiledSchema } from "./compiledSchema.ts";

export const tofo = withClient(db, compiledSchema);
