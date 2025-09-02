import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserRole } from '../common/enums/role.enum'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    findById(id: string) {
        return this.userModel.findById(id).lean()
    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).lean()
    }

    findAll() {
        return this.userModel.find().lean()
    }

    async updateRole(id: string, role: UserRole) {
        return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).lean()
    }

    async delete(id: string) {
        return this.userModel.findByIdAndDelete(id)
    }
}
