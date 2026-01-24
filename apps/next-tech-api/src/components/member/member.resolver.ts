import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import {
  LoginInput,
  MemberInput,
  MembersInquiry,
  SellersInquiry,
} from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';
import { getSerialForImage, validMimeTypes } from '../../libs/config';
@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => Member)
  /* -------------------------------  signup ------------------------------ */
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('Mutation: Signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  /* ------------------------------- login ------------------------------- */
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  /* ------------------------------  checkAuth ------------------------------ */
  public async checkAuth(@AuthMember() memberData: Member): Promise<String> {
    return `hi ${memberData.memberNick} your id ${memberData._id}`;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  /* -----------------------------  updateMember ---------------------------- */
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    delete input._id;
    return await this.memberService.updateMember(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Member)
  /* ------------------------------  getMember ------------------------------ */
  public async getMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    const targetId = shapeIntoMongoObjectId(input);
    return await this.memberService.getMember(memberId, targetId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Members)
  /* ------------------------------  getSeller ------------------------------ */
  public async getSeller(
    @Args('memberId') input: SellersInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Members> {
    return this.memberService.getSeller(memberId, input);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    ADMIN                                   */
  /* -------------------------------------------------------------------------- */

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  /* ------------------------- // getAllMembersByAdmin ------------------------ */
  public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
    return await this.memberService.getAllMembersByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  /* ------------------------- // updateMemberByAdmin ------------------------- */
  public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
    return await this.memberService.updateMemberByAdmin(input);
  }

  /* -------------------------------------------------------------------------- */
  /*                               IMAGE UPLOADER                               */
  /* -------------------------------------------------------------------------- */

  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
  ): Promise<string> {
    console.log('Mutation: imageUploader');

    if (!filename) throw new Error(Message.UPLOAD_FAILED);
    const validMime = validMimeTypes.includes(mimetype);
    if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

    const imageName = getSerialForImage(filename);
    const url = `uploads/${target}/${imageName}`;
    const stream = createReadStream();

    const result = await new Promise((resolve, reject) => {
      stream
        .pipe(createWriteStream(url))
        .on('finish', async () => resolve(true))
        .on('error', () => reject(false));
    });
    if (!result) throw new Error(Message.UPLOAD_FAILED);

    return url;
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: String,
  ): Promise<string[]> {
    console.log('Mutation: imagesUploader');

    const uploadedImages: string[] = [];
    const promisedList = files.map(
      async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
        try {
          const { filename, mimetype, encoding, createReadStream } = await img;

          const validMime = validMimeTypes.includes(mimetype);
          if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

          const imageName = getSerialForImage(filename);
          const url = `uploads/${target}/${imageName}`;
          const stream = createReadStream();

          const result = await new Promise((resolve, reject) => {
            stream
              .pipe(createWriteStream(url))
              .on('finish', () => resolve(true))
              .on('error', () => reject(false));
          });
          if (!result) throw new Error(Message.UPLOAD_FAILED);

          uploadedImages[index] = url;
        } catch (err) {
          console.log('Error, file missing!');
        }
      },
    );

    await Promise.all(promisedList);
    return uploadedImages;
  }
}
