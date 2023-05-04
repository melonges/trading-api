import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";

@Injectable()
export class HashService {
   async hash(password: string): Promise<string> {
      return await hash(password, 10);
   }

   async compare(password: string, hashedPassword: string): Promise<boolean> {
      return await compare(password, hashedPassword);
   }
}
