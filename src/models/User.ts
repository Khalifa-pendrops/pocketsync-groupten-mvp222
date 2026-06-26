import mongoose, { Document, Schema, FlattenMaps } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  refreshTokenHash?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;

  comparePassword(candidate: string): Promise<boolean>;
  toJSON(): FlattenMaps<this> & { _id: mongoose.Types.ObjectId; __v: number };
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    username: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple nulls
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Hash password before save
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password helper
UserSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Strip sensitive fields from JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  return obj;
};

export default mongoose.model<IUser>("User", UserSchema);
