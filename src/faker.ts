import { faker } from "@faker-js/faker";
import { ChildEntity, OtherEntity, RootEntity } from "./entities";
import { randomUUID } from "node:crypto";

export function* genSql(batches: number, batchSize: number): Generator<string> {
  for (let i = 0; i < batches; i++) {
    const entities = faker.helpers.multiple(createRandomRootEntity, {
      count: batchSize,
    });
    yield `
      WITH re AS (
        INSERT INTO root_entity ("firstName", "lastName", "age")
        VALUES ${entities
          .map(
            (entity) =>
              `('${entity.firstName!.replace(
                /'/g,
                "''"
              )}', '${entity.lastName!.replace(/'/g, "''")}', ${entity.age})`
          )
          .join(",")}
        RETURNING id
      ), ce AS (
        INSERT INTO child_entity ("rootEntityId", "uuid", "name")
        SELECT
          re.id,
          ce.uuid,
          ce.name
        FROM (
          VALUES ${entities
            .map((entity) =>
              entity
                .children!.map(
                  (childEntity) =>
                    `('${childEntity.uuid}'::uuid, '${childEntity.name!.replace(
                      /'/g,
                      "''"
                    )}')`
                )
                .join(",")
            )
            .join(",")}
        ) AS ce(uuid,name)
        CROSS JOIN re
        ON CONFLICT (uuid) DO NOTHING
        RETURNING id, uuid
      )
      INSERT INTO other_entity ("childEntityId", "config")
      SELECT
        ce.id,
        oe.config
      FROM (
        VALUES ${entities
          .map((entity) =>
            entity
              .children!.map(
                (childEntity) =>
                  `('${childEntity.uuid}'::uuid, '${JSON.stringify(
                    childEntity.otherEntity.config
                  )!.replace(/'/g, "''")}'::jsonb)`
              )
              .join(",")
          )
          .join(",")}
      ) AS oe(uuid,config)
      JOIN ce ON ce.uuid = oe.uuid
    `;
  }
}

export function createRandomRootEntity(): Partial<RootEntity> {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 99 }),
    children: faker.helpers.multiple(createRandomChildEntity, {
      count: faker.number.int({ min: 5, max: 50 }),
    }) as ChildEntity[],
  };
}

export function createRandomChildEntity(): Partial<ChildEntity> {
  return {
    uuid: randomUUID(),
    name: faker.person.fullName(),
    otherEntity: createRandomOtherEntity() as OtherEntity,
  };
}

export function createRandomOtherEntity(): Partial<OtherEntity> {
  return {
    config: {
      ip: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    },
  };
}
