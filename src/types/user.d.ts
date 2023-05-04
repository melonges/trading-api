import { User } from "src/users/entities/user.entity";

export interface RequestUser extends Request {
   user: User;
}
