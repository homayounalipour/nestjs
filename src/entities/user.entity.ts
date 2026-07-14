import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export default class Users {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ length: 25, nullable: true })
  first_name!: string;

  @Column({ length: 25, nullable: true })
  last_name!: string;

  @Column({ nullable: true })
  age!: number;

  @Column({ select: false, nullable: false })
  password!: string;

  @Column({ nullable: true })
  avatar!: string;
}
