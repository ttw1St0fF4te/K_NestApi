import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Carts } from "./Carts";
import { Favorites } from "./Favorites";
import { Orders } from "./Orders";
import { Reviews } from "./Reviews";
import { UserRoles } from "./UserRoles";

@Index("PK_Users", ["id"], { unique: true })
@Index("IX_Users_UserRoleId", ["userRoleId"], {})
@Entity("Users", { schema: "public" })
export class Users {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("text", { name: "Username" })
  username: string;

  @Column("text", { name: "Password" })
  password: string;

  @Column("integer", { name: "UserRoleId" })
  userRoleId: number;

  @Column("text", { name: "Email", nullable: true })
  email: string | null;

  @Column("text", { name: "LoyaltyLevel", nullable: true })
  loyaltyLevel: string | null;

  @Column("numeric", { name: "TotalSpent", nullable: true })
  totalSpent: string | null;

  @Column("numeric", { name: "WalletBalance", nullable: true })
  walletBalance: string | null;

  @OneToMany(() => Carts, (carts) => carts.user)
  carts: Carts[];

  @OneToMany(() => Favorites, (favorites) => favorites.user)
  favorites: Favorites[];

  @OneToMany(() => Orders, (orders) => orders.user)
  orders: Orders[];

  @OneToMany(() => Reviews, (reviews) => reviews.user)
  reviews: Reviews[];

  @ManyToOne(() => UserRoles, (userRoles) => userRoles.users, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "UserRoleId", referencedColumnName: "id" }])
  userRole: UserRoles;
}
