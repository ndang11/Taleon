import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "../tenants/tenant.entity";
import { User } from "../users/user.entity";

@Entity()
export class Post {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column()
	title!: string;

	@Column("text")
	content!: string;

	@ManyToOne(() => User)
	author!: User;

	@ManyToOne(() => Tenant)
	tenant!: Tenant;
}
