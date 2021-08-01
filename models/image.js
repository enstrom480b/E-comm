const mongoose=require('mongoose')
const schema=mongoose.Schema
const imageschema=new schema({
image:{
    type:String,
	required:true
},
date:{
    type:String,
    default:true
}
})
mongoose.model('image',imageschema)