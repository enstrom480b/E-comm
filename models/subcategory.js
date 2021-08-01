const mongoose=require('mongoose')
const schema=mongoose.Schema
const subcategoryschema=new schema({
subtitle:{
    type:String
},
subitem:{
    type:String
},
subcategory:{
    type:String
}

})

mongoose.model('subcategorytable',subcategoryschema)