import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { User } from "../../users/entities/user.entity";

@Index("favorites_pkey", ["id"], { unique: true })
@Entity("Favorites", { schema: "public" })
export class Favorite {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @ManyToOne(() => Product, (product) => product.favorites, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: User;
}
