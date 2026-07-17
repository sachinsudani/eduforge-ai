import { Injectable, Logger, OnModuleInit, UnauthorizedException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from '../users/schemas/user.schema'
import { UserRole } from '../common/enums/role.enum'

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService
    ) { }

    async onModuleInit() {
        await this.seedAdmin()
    }

    private async seedAdmin() {
        const email = this.config.get<string>('ADMIN_EMAIL')
        const password = this.config.get<string>('ADMIN_PASSWORD')
        if (!email || !password) return
        const adminExists = await this.userModel.exists({ role: UserRole.Admin })
        if (adminExists) return
        const passwordHash = await bcrypt.hash(password, 10)
        await this.userModel.create({
            email,
            firstName: 'Admin',
            lastName: 'User',
            passwordHash,
            role: UserRole.Admin
        })
        this.logger.log(`Seeded initial admin account: ${email}`)
    }

    async signup(
        email: string,
        firstName: string,
        lastName: string,
        password: string,
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
            role: UserRole.Student,
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
