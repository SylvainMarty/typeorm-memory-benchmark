import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  Relation,
  JoinColumn,
} from "typeorm";

@Entity()
export class RootEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  age!: number;

  @OneToMany(() => ChildEntity, (child) => child.rootEntity)
  children!: Relation<ChildEntity[]>;
}

@Entity()
export class ChildEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  uuid!: string;

  @Column()
  name!: string;

  @ManyToOne(() => RootEntity)
  @JoinColumn()
  rootEntity!: Relation<RootEntity>;

  @OneToOne(() => OtherEntity, (other) => other.childEntity)
  otherEntity!: Relation<OtherEntity>;
}

@Entity()
export class OtherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "jsonb", nullable: true })
  config?: Record<string, any> | null;

  @OneToOne(() => ChildEntity)
  @JoinColumn()
  childEntity!: Relation<ChildEntity>;
}
