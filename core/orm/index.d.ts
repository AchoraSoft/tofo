type DBType = "postgres" | "mysql";
interface DBConfig {
  user: string;
  password: string;
  database: string;
  hostname: string;
  port: number;
  tls?: boolean;
}
