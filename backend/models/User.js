// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt, hashValue } from '../config/encryption.js';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: Object, 
      required: true,
      get: function(value) {
        return decrypt(value) || value;
      }
    },
    email: { 
      type: Object, 
      required: true, 
      unique: true,
      get: function(value) {
        return decrypt(value) || value;
      }
    },
    emailHash: { type: String, required: true, index: true },
    nameHash: { type: String, required: true, index: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'carniceria', 'cliente'],
      default: 'cliente',
      required: true,
    },
    purchases: { type: Number, default: 0 },
    isFrequent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

userSchema.pre("save", function (next) {
  console.log('🔍 Pre-save middleware running for user');
  
  if (this.isModified("name") && typeof this.name === "string") {
    console.log('🔍 Encrypting name:', this.name);
    const encrypted = encrypt(this.name);
    this.name = {
      iv: encrypted.iv,
      data: encrypted.data,
      tag: encrypted.tag
    };
    this.nameHash = hashValue(encrypted.data);
    console.log('✅ Name encrypted and nameHash generated');
  }
  
  if (this.isModified("email") && typeof this.email === "string") {
    console.log('🔍 Encrypting email:', this.email);
    const encrypted = encrypt(this.email);
    this.email = {
      iv: encrypted.iv,
      data: encrypted.data,
      tag: encrypted.tag
    };
    this.emailHash = hashValue(encrypted.data);
    console.log('✅ Email encrypted and emailHash generated');
  }
  
  console.log('🔍 nameHash:', this.nameHash);
  console.log('🔍 emailHash:', this.emailHash);
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
