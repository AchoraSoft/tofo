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
