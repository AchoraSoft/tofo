export function parseDatabaseUrl(url: string) {
  const pattern = /^postgres(?:ql)?:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)$/;

  const match = url.match(pattern);
  if (!match) throw new Error("Invalid DATABASE_URL");

  const [, user, password, hostname, port, database] = match;

  return {
    user,
    password,
    database,
    hostname,
    port: parseInt(port),
  };
}

export function buildWhereClause(where: Record<string, any>) {
  const keys = Object.keys(where);

  const clause = keys.map((key) => `${key} = ${where[key]}`).join(" AND ");
  const params = Object.values(where);

  return { clause, params };
}

export function buildInsertQuery(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const columns = keys.join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = Object.values(data);
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders});`;
  return { sql, params: values };
}

export function buildUpdateQuery(
  table: string,
  where: Record<string, any>,
  data: Record<string, any>
) {
  const dataKeys = Object.keys(data);
  const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const dataValues = Object.values(data);

  const whereOffset = dataKeys.length;
  const whereClauseParts = Object.keys(where).map(
    (key, i) => `${key} = $${whereOffset + i + 1}`
  );
  const whereClause = whereClauseParts.join(" AND ");
  const whereValues = Object.values(where);

  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause};`;
  return { sql, params: [...dataValues, ...whereValues] };
}
