import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "../../carts/entities/cart.entity";
import { Favorite } from "../../favorites/entities/favorite.entity";
import { Order } from "../../orders/entities/order.entity";
import { Review } from "../../reviews/entities/review.entity";
import { UserRole } from "../../user-roles/entities/user-role.entity";

@Index("PK_Users", ["id"], { unique: true })
@Index("IX_Users_UserRoleId", ["userRoleId"], {})
@Entity("Users", { schema: "public" })
export class User {
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

  @Column("decimal", {
    name: "TotalSpent",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  totalSpent: number | null;

  @Column("decimal", {
    name: "WalletBalance",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  walletBalance: number | null;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @ManyToOne(() => UserRole, (userRole) => userRole.users)
  @JoinColumn([{ name: "UserRoleId", referencedColumnName: "id" }])
  userRole: UserRole;
}
