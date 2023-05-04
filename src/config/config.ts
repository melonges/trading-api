import { ConfigService } from "@nestjs/config";

export const typeOrmConfig = (configService: ConfigService) => ({
  type: configService.get("DB_TYPE"),
  host: configService.get("DB_HOST"),
  port: configService.get("DB_PORT"),
  username: configService.get("DB_USERNAME"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_DATABASE"),
  // entities: [User, Bet],
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  synchronize: configService.get("DB_SYNCHRONIZE"),
});
