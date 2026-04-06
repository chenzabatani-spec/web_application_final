import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password?: string;
    photo?: string;
    refreshTokens?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    photo: { 
        type: String,
         required: false 
    },
    refreshTokens: {
        type: [String],
        default: [],
    }
});

userSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (doc: any, ret: any) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
    }
});

const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;