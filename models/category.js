const mongoose=require('mongoose')
const schema=mongoose.Schema
const productschema=new schema({
title:{
    type:String
},
item:{
    type:String
}

})

mongoose.model('categorytable',productschema)