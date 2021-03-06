import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { compare, hash } from "bcryptjs";
import { User } from "./entity/User";
import { sign } from "jsonwebtoken";
import { MyContext } from "./MyContext";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "HI";
  }
  @Query(() => [User])
  users() {
    return User.find();
  }
  @Mutation(() => LoginResponse)
  async Login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("could find the User");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("Password is wrong");
    }
    // Login Successful

    res.cookie(
      "kid",
      sign({ userId: user.id }, "qeioruqowrqowri", { expiresIn: "7d" }),
      { httpOnly: true }
    );
    return {
      accessToken: sign({ userId: user.id }, "djfalsdkfjalskdfj", {
        expiresIn: "15m",
      }),
    };
  }
  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({ email: email, password: hashedPassword });
    } catch (e) {
      return false;
    }
    return true;
  }
}
