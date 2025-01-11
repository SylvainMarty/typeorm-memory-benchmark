import { DataSource, Equal, Repository } from "typeorm";
import { RootEntity } from "./entities";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

type Stat = {
  x: string;
} & NodeJS.MemoryUsage;

export async function runBenchmark(
  benchmarkName: string,
  connection: DataSource
) {
  let rootEntityRepo = connection.getRepository(RootEntity);

  const stats: Stat[] = [];
  for (let i = 0; i < 200; i++) {
    console.log(`Iteration ${i}`);
    await runIteration(rootEntityRepo, stats);
  }
  console.log("Benchmarks done, saving stats...");
  const statFile = `stats/stats-${benchmarkName}.json`;
  let existingStats = {};
  if (
    await fs
      .stat(statFile)
      .then(() => true)
      .catch((e) => false)
  ) {
    existingStats = JSON.parse(
      (await fs.readFile(`stats/stats-${benchmarkName}.json`)).toString()
    );
  }
  await fs.writeFile(
    `stats/stats-${benchmarkName}.json`,
    JSON.stringify({ ...existingStats, [Date.now()]: stats })
  );
}

async function runIteration(
  rootEntityRepo: Repository<RootEntity>,
  stats: Stat[]
) {
  stats.push({
    x: `${stats.length}`,
    ...process.memoryUsage(),
  });

  assert(
    !!(await rootEntityRepo.findOne({
      where: {
        id: Equal(1),
      },
      relations: ["children", "children.otherEntity"],
    }))
  );
  stats.push({
    x: `${stats.length}`,
    ...process.memoryUsage(),
  });

  assert(
    (
      await rootEntityRepo.find({
        relations: ["children", "children.otherEntity"],
        take: 100,
        order: {
          id: "ASC",
        },
      })
    ).length === 100
  );
  stats.push({
    x: `${stats.length}`,
    ...process.memoryUsage(),
  });
}
