import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  public healthCheck(): string {
    return 'GraphQl Api Server';
  }
}
