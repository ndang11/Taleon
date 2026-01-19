import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Tenant {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column()
	name!: string;
}
