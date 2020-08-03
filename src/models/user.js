const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true, 
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required:true,
        minlength:7,
        trim: true,
        validate(value){
            if(value.includes('password')){
                throw new Error('Password must not contain "password" ')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    avatar:{
        type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

}, {
    timestamps:true
})

userSchema.virtual('tasks', {       // defining a relationship
    ref:'Task',
    localField: '_id',
    foreignField: 'owner'           // owner field of task relates to _id of the user
})

userSchema.methods.generateAuthToken = async function () {  // applicable on instances
    const user = this
    const token = jwt.sign({ _id:user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {     // applicable on class User
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to log in')
    }

    const ismMatched = await bcrypt.compare(password,user.password)
    
    if(!ismMatched){
        throw new Error('unable to log in')
    }

    return user
}


//  Hash plaintext passsword before saving
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

userSchema.pre('remove',async function (next) {
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User