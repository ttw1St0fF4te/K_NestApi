import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("PK_UserRoles", ["id"], { unique: true })
@Entity("UserRoles", { schema: "public" })
export class UserRoles {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("text", { name: "Role" })
  role: string;

  @OneToMany(() => Users, (users) => users.userRole)
  users: Users[];
}
