import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Products } from "./Products";
import { Users } from "./Users";

@Index("favorites_pkey", ["id"], { unique: true })
@Entity("Favorites", { schema: "public" })
export class Favorites {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @ManyToOne(() => Products, (products) => products.favorites, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Products;

  @ManyToOne(() => Users, (users) => users.favorites, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: Users;
}
