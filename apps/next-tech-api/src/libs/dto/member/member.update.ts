import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberType } from '../../enums/member.enum';
import type { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
  // memberUpdate
  @IsOptional()
  @Field(() => String, { nullable: true })
  _id?: ObjectId;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Length(4, 12)
  @Field(() => String, { nullable: true })
  memberPhone?: string;

  @IsOptional()
  @Length(3, 12)
  @Field(() => String, { nullable: true })
  memberNick?: string;

  @IsOptional()
  @Length(3, 18)
  @Field(() => String, { nullable: true })
  memberFullName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberImage?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberAddress?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberDesc?: string;
}
