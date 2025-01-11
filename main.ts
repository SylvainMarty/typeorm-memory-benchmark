import { DataSource } from "typeorm";
import { connectDatabase, seedDatabase } from "./src/database";
import { runBenchmark } from "./src/benchmark";

async function main() {
  let cmd =
    process.argv.length === 5
      ? process.argv[process.argv.length - 2]
      : process.argv[process.argv.length - 1];
  const env = {
    baseConnectionUrl: "postgres://postgres:ThisIsNotAPassword@127.0.0.1:5433",
    databaseName: "postgres",
  };
  let connection: DataSource | undefined;
  if (cmd === "bench") {
    let target = process.argv[process.argv.length - 1];
    if (target === cmd) {
      target = "master";
    }
    console.log(`Benchmarking target ${target}...`);
    connection = await connectDatabase(
      env.baseConnectionUrl,
      env.databaseName,
      false
    );
    await runBenchmark(target, connection);
  } else if (cmd === "seed") {
    console.log("Seeding...");
    connection = await seedDatabase(env.baseConnectionUrl, env.databaseName);
  } else {
    throw new Error(`Unknown command: ${cmd}`);
  }
  await connection.destroy();
}

main();
