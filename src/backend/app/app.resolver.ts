import {
    Query,
    Resolver,
    Field,
    ObjectType,
} from "@nestjs/graphql";


@ObjectType()
export class Book {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;
}

@Resolver()
export class AppResolver {
  constructor() {}

  @Query(returns => [Book])
  async books() {
    return [
      {
        id: 1,
        title: 'Book 1',
        description: 'Description 1',
      },
      {
        id: 2,
        title: 'Book 2',
        description: 'Description 2',
      },
      {
        id: 3,
        title: 'Book 3',
        description: 'Description 3',
      },
    ];
  }
}
