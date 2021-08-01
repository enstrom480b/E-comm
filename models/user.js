const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const schema=mongoose.Schema
const userschema=new schema({
name:{
    type:String,
    required:true,
	max:64,
	trim:true
},
img:{
    type:String
},
password:{
    type:String,
    required:true,
	minLength:6
},
email:{
    type:String,
    required:true,
	lowercase:true,
	unique:true,
	trim:true
},
date:{
    type:String,
    default:true
},
admin:{
    type:String
},
user:{
    type:String
},
isloggedin:{
    type:Boolean
},
resetlink:{
	data:String,
	default:''
}
})
userschema.pre('save',async function(next){
	const salt=await bcrypt.genSalt()
	this.password=await bcrypt.hash(this.password,salt)
	next()
})

userschema.statics.login=async function (email,password){
	const user=await this.findOne({email})
	
	if(user){
		const auth=await bcrypt.compare(password,user.password)

	if(auth){
		return user
	} 



	throw Error('incorrect password')
	
	}



	throw Error('incorrect email')
	
}






mongoose.model('users',userschema)