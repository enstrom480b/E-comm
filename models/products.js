var mongoose=require('mongoose')
var productsschema=mongoose.Schema({
    title:
    {
        type:String,
        required:true
    } ,
    item:
    {
        type:String,
        required:true

    },
    desc:
    {
            type:String,
            required:true
    } ,
    category:
     {
            type:String,
            required:true
    },
    price:
    {
            type:Number,
            required:true
    } ,
    ads:{
            type:String
    },
    itemname:{
            type:String,
            required:true
    },
    adsvalue:{
        type:Number
    },

    subcategory:{
        type:String
    },

    location:{
        type:String
    },

    image:
    {
            type:String
    }
})
module.exports=mongoose.model('products',productsschema)