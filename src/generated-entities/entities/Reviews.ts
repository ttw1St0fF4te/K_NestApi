import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Products } from "./Products";
import { Users } from "./Users";

@Index("PK_Reviews", ["id"], { unique: true })
@Index("IX_Reviews_ProductId", ["productId"], {})
@Index("IX_Reviews_UserId", ["userId"], {})
@Entity("Reviews", { schema: "public" })
export class Reviews {
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

  @ManyToOne(() => Products, (products) => products.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "ProductId", referencedColumnName: "id" }])
  product: Products;

  @ManyToOne(() => Users, (users) => users.reviews, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "UserId", referencedColumnName: "id" }])
  user: Users;
}
