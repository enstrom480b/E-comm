const jwt=require('jsonwebtoken')
const usermodels=require('../models/user')
const mongoose=require('mongoose')
const User=mongoose.model('users')

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox0b97a7f64ee0419dbc5dd9e12d5a8e4c.mailgun.org";
const mg = mailgun({apiKey: "8112c491df43c84299af1ced566b93fe-aff8aa95-5f700d0c", domain: DOMAIN});
const handleerrors=(err)=>{

let errors={email:'',password:''}
if(err.code===11000){
	errors.email='that email is already registered'
	return errors
}

if(err.message.includes('user validation failed')){

Object.values(err.errors).forEach(({properties})=>{
errors[properties.path]=properties.message
})

}
console.log(err.message,err.code)
return errors

}

const checkuser= (req,res,next)=>{
	const token=req.cookies.jwt
	if(token){
		jwt.verify(token,'secret',async(err,decoded)=>{
				
			if(err){
				res.locals.user=null
					//res.locals.user=admin
				next()
			}else{
			let user=await User.findOne({_id:decoded.id})
	
			res.locals.user=user
             next()
             	
			}
			
		})
	}
	else{
		res.locals.user=null
		next()
	}
}


const requireauth=(req,res,next)=>{
	const token=req.cookies.jwt
	if(token){
		jwt.verify(token,'secret',(err,decoded)=>{
			if(err){
		
				res.render('login')
			}else{
				next()
			}
		})
	}
	else{
		res.redirect('/login')
	}
}



const isadmin=(req,res,next)=>{
	
	const token=req.cookies.jwt
	if(token){
		jwt.verify(token,'secret',async(err,decoded)=>{
					
		   if(err)
		   {
			let user=await User.findOne({_id:decoded.id})
		
		   }
				
				if(res.locals.user.admin==='admin'){
				res.redirect('/admin')
		 next()
			}
			else{
			
				next()
			}
				
			
		})
	
	}
	else{
		res.redirect('/login')
	}
	
	
}


module.exports={checkuser,requireauth,isadmin,handleerrors}