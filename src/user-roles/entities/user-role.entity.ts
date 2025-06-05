import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Index("PK_UserRoles", ["id"], { unique: true })
@Entity("UserRoles", { schema: "public" })
export class UserRole {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("text", { name: "Role" })
  role: string;

  @OneToMany(() => User, (user) => user.userRole)
  users: User[];
}
