import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from '../users/schemas/user.schema'
import { UserRole } from '../common/enums/role.enum'

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService
    ) { }

    async signup(
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        role: UserRole,
        headline?: string,
        avatarUrl?: string
    ) {
        const existing = await this.userModel.findOne({ email }).lean()
        if (existing) throw new ConflictException('Email already registered')
        const passwordHash = await bcrypt.hash(password, 10)
        const created = await this.userModel.create({
            email,
            firstName,
            lastName,
            passwordHash,
            role,
            headline,
            avatarUrl
        })
        return this.issueToken(created)
    }

    async login(email: string, password: string) {
        const user = await this.userModel.findOne({ email })
        if (!user) throw new UnauthorizedException('Invalid credentials')
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) throw new UnauthorizedException('Invalid credentials')
        return this.issueToken(user)
    }

    private issueToken(user: Pick<User, 'email' | 'role' | 'firstName' | 'lastName'> & { id?: string; _id?: any }) {
        const payload = { sub: String(user._id ?? user.id), email: user.email, role: user.role }
        const accessToken = this.jwtService.sign(payload)
        return { accessToken }
    }
}
