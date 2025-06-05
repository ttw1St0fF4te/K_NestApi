import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { User } from "../../users/entities/user.entity";

@Index("PK_Reviews", ["id"], { unique: true })
@Index("IX_Reviews_ProductId", ["productId"], {})
@Index("IX_Reviews_UserId", ["userId"], {})
@Entity("Reviews", { schema: "public" })
export class Review {
  @PrimaryGeneratedColumn({ type: "integer", name: "Id" })
  id: number;

  @Column("text", { name: "Text" })
  text: string;

  @Column("integer", { name: "Rating" })
  rating: number;

  @Column("timestamp with time zone", { name: "Date" })
  date: Date;

  @Column("integer", { name: "ProductId" })
  productId: number;

  @Column("integer", { name: "UserId" })
  userId: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: User;
}
