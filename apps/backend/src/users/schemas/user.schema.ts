import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { UserRole } from '../../common/enums/role.enum'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, index: true })
    email!: string

    @Prop({ required: true })
    firstName!: string

    @Prop({ required: true })
    lastName!: string

    @Prop({ required: true })
    passwordHash!: string

    @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.Student })
    role!: UserRole

    @Prop()
    headline?: string

    @Prop()
    avatarUrl?: string
}

export const UserSchema = SchemaFactory.createForClass(User)
