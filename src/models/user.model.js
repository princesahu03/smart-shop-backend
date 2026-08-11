import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true })


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Password check:
userSchema.methods.isPasswordCorrect = 
  async function(password) {
    return await bcrypt.compare(
      password, 
      this.password
    )
  }

// Token generate:
userSchema.methods.generateToken = 
  function() {
    return jwt.sign(
      { _id: this._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    )
  }

export const User = mongoose.model(
  'User', userSchema
)