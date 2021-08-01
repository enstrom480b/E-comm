const mongoose=require('mongoose')
const schema=mongoose.Schema
const userpref=new schema({
title:{
    type:String
},
userid:{
    type:String
},
item:{
    type:String
},
itemname:{
    type:String
},
desc:{
    type:String
},
category:{
    type:String
},
price:{
    type:String
},
ads:{
    type:String
},
adsvalue:{
    type:String
},
subcategory:{
    type:String
},
image:{
    type:String
},
location:{
    type:String
}

})
mongoose.model('userdata',userpref)