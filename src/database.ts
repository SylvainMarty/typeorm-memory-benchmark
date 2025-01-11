import { DataSource } from "typeorm";
import { Client } from "pg";
import { ChildEntity, OtherEntity, RootEntity } from "./entities";
import { genSql } from "./faker";

export async function connectDatabase(
  dbConnectionUrl: string,
  dbName: string,
  sync: boolean
) {
  const connection = new DataSource({
    type: "postgres",
    url: `${dbConnectionUrl}/${dbName}?sslmode=disable`,
    entities: [OtherEntity, ChildEntity, RootEntity],
    synchronize: sync,
  });
  await connection.initialize();
  console.log("Connection initialized");

  return connection;
}

export async function seedDatabase(dbConnectionUrl: string, dbName: string) {
  const client = new Client({
    connectionString: `${dbConnectionUrl}?sslmode=disable`,
  });
  await client.connect();
  await client.query(`
    DROP DATABASE IF EXISTS ${dbName};
  `);
  console.log("Database dropped");
  await client.query(`
    CREATE DATABASE ${dbName};
  `);
  console.log("Database created");
  await client.end();

  const connection = await connectDatabase(dbConnectionUrl, dbName, true);

  console.log("Seeding database...");
  for (const sql of genSql(10, 100)) {
    await connection.query(sql);
  }
  console.log("Database seeding done");

  return connection;
}
