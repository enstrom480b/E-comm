const express=require('express')
const app=express()
var path=require('path')
//app.use(express.static(path.join(__dirname,'uploads')))
app.use(express.static(path.join(__dirname,'public')))
const jwt=require('jsonwebtoken')
const {checkuser,requireauth,isadmin,handleerrors}=require('./auth/auth')
const passport=require('passport')
app.use(passport.initialize())
app.use(passport.session())
const mongoose=require('mongoose')

const categorymodel=require('./models/category')
const Category=mongoose.model('categorytable')

const userprefmodel=require('./models/userpref')
const Userpref=mongoose.model('userdata')

const subcategorymodel=require('./models/subcategory')
const Subcategory=mongoose.model('subcategorytable')


const productsmodel=require('./models/products')
const Products=mongoose.model('products')

const usermodels=require('./models/user')
const User=mongoose.model('users')


const localstrategy=require('passport-local').Strategy

const car=require('./models/carmodels')
const Car=mongoose.model('cartable')

const guestmodel=require('./models/guestmodel')
const Guestnewcar=mongoose.model('guestcartable')

const imagemodels=require('./models/image')

const override=require('method-override')
const expresslayouts=require('express-ejs-layouts')
const bcrypt=require('bcrypt')
var cookieparser=require('cookie-parser')
var bodyparser=require('../Documents/node_modules/body-parser')
var ejs=require('ejs')
var flash=require('connect-flash')
var session=require('express-session')
const sharp=require('sharp')
var methodOverride=require('method-override')
const expressvalidator = require('express-validator')
app.use(methodOverride('_method'))
const multer=require('multer')
app.set('view engine','ejs')
var fs=require('fs')
mongoose.connect('mongodb://localhost/loginapp',{useNewUrlParser:true,useUnifiedTopology:true})
app.use(require('express-session')({
    secret:'sdsddssecret',    saveUninitialized:true,
    resave:true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
}))
app.use(flash())
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(cookieparser())
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(expressvalidator({
    errorFormatter:function(param,msg,value) {
        var namespace=param.split('.')
        ,root=namespace.shift()
        ,formParam=root
        while(namespace.length)
{
    formParam+='['+namespace.shift()+']'
}    
return{
    param:formParam,
    msg:msg,
    value:value
}
}
}))
app.use('*',checkuser)
const index=require('./routes')
const products = require('./models/products')
const { image, vehicle } = require('faker')
const { forEach } = require('async')
const { array, valid } = require('joi')
const { createEmitAndSemanticDiagnosticsBuilderProgram } = require('typescript')
app.use(index)
app.use('/guest/addcars',index)
app.use('/morelistings/:id',index)
app.use('/signup',index)
app.use('/editpage/:id',index)

app.get('/admin/users/addcars',function(req,res,next) {
    res.render('addcars')
 })
 app.get('/smsdata',function(req,res,next){
     res.render('SMS')
 })
 var arr=[]
 var x=[];
app.use(function(req,res,next){
res.locals.success_msg=req.flash('success_msg')
res.locals.error_msg=req.flash('error_msg')
res.locals.error=req.flash('error')
res.locals.tracks=req.session.tracksdata
next()
})
 const maxage=3*24*60*60
 const createtoken=(id)=>{
     return jwt.sign({id},'secret',{
         expiresIn:maxage
     })
 }
const  mime_type_map={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}
const storage=multer.diskStorage({
	destination:'./public/uploads/images',
    filename:function (req,file,callback) {
        callback(null,file.filename+'-'+Date.now()+path.extname(file.originalname))    },
    filefilter:function(req,file,cb){
    checkfiletype(file,cb)
    }

})
const upload=multer({
    storage:storage,
    imits:{
    fieldsize:1024*1024*3
    }
})
var db=mongoose.connection
if(db){
    console.log('db connected')

app.post('/search',bodyparser.urlencoded({extended:false}),function(req,res){
    Car.find({
        carmake:req.body.txt
    }).then((data)=>{
        res.render('searchpage',{
            data:data
        })
    })
})



app.post('/multisearch',bodyparser.urlencoded({extended:false}),function(req,res){
    var carmake=(req.body.carmake)
    var model=(req.body.model)
    var year=(req.body.year)
    var engine=(req.body.engine) 
    var transmission=(req.body.transmission)
    Car.aggregate([
        {$match:{$and:[{carmake:carmake},{engine:engine},{carmodel:model}]}}
    ]).then((data)=>{
         res.render('searchpage',{
             data:data
         })
     })
 })
 app.get('/addcategory',(req,res)=> {

	res.render('addcategory')
})

app.get('/delete-category/:id',(req,res)=> {
    var id=req.params.id
    Category.findByIdAndRemove(id).then((err,data)=>{
        console.log('data removed')
        res.redirect('/allcategory')
    })

})
app.get('/delete-products/:id',(req,res)=> {
    var id=req.params.id
    Products.findByIdAndRemove(id).then((err,data)=>{
        console.log('data removed')
        res.redirect('/allproducts')
    })

})
app.post('/searchproduct',(req,res)=> {
    var id=req.body.searchproducts
  
    products.find().then((err,data)=>{
        res.render('allproducts',{
            data:data
        })
    })

})


app.get('/addsubcategory',(req,res)=> {
res.render('subcategory')
})

app.post('/subcategory',(req,res)=> {
    var {subtitle,subitem,category}=req.body
var subcategory=new Subcategory({
    subtitle:subtitle,
    subitem:subitem,
    category:category

})
subcategory.save().then((err,data)=>{
    console.log(data,'item saved')
})
    products.find().then((err,data)=>{
        res.render('addsubcategory',{
            data:data
        })
    })

})

app.post('/addcategory',bodyparser.urlencoded({extended:false}),(req,res)=> {
    const {title,item}=req.body
    Category.findOne({title:title}).then((data)=>{
        if(data){
            console.log('title already inserted')
            res.redirect('/addcategory')
        }
        else{
        const category=new Category({
        title:title,
        item:item
    })
         category.save()
          res.redirect('/addcategory')
        }

    })
   
})
app.get('/addproducts',(req,res)=> {
   res.render('addproducts')
})

app.get('/allproducts',async (req,res)=> {
    var countdata

await products.count().then((datacounts)=>{
      countdata=datacounts

 })

    var catdata
await Category.find({}).then((datap)=>{
      catdata=datap
 })


 products.find().sort({'adsvalue':-1}).then((data)=>{
     res.render('allproducts',{
        category:data[0].title,
         data:data,
         catdata:catdata,
         countdata:countdata,
         tracksdata:x
       
     })
    })
        var val
    for(var i=0;i<x.length;i++)
    {
         val=x[i]
    }
 if(typeof val!=='undefined')
 {


   Userpref.find().then((data)=>{
       var datatitle;
    for(var i=0;i<data.length;i++)
    {
        datatitle=data[i].userid
    }    

        if(datatitle==val._id){
        console.log('user already added',typeof datatitle,typeof val._id)  
       }
      else{
        var userdata= new Userpref({
            userid:val._id,
           title: val.title,
           item: val.item,
           itemname: val.itemname,
           desc: val.desc,
           category: val.category,
           price:val.price,
           ads:val.ads,
           adsvalue: val.adsvalue,
           subcategory:val. subcategory,
           image:val.image,
           location: val.location
        })
        userdata.save().then(()=>{
            console.log('new data added',datatitle==val._id)  
        })   

console.log(x)
       
         }

   })
 }

})

app.get('/edit-category/:id',(req,res)=> {
    Category.findById(req.params.id).then((data)=>{
     res.render('edit-category',{
         title:data.title,
         item:data.item,
         id:data._id
     })
    })

 })

   app.get('/edit-products/:id',(req,res)=> {
        Products.findById(req.params.id).then((data)=>{
         res.render('edit-products',{
             title:data.title,
             item:data.item,
             id:data._id,
             category:data.category,
             price:data.price,
             desc:data.desc,
             ads:data.ads,
             adsvalue:data.adsvalue,
             itemname:data.itemname,
             image:data.image

         })
        })
    
         })
         app.get('/edit-products',(req,res)=> {
             res.render('edit-products')
         })

app.get('/allproducts/:id',(req,res)=> {
products.find({category:req.params.id}).then((data)=>{
 res.render('allproducts',{
   subcategory:data
 })
})
 })

 app.get('/allproducts/moreinfo/:id',(req,res)=> {
    var location
    products.find().then((data)=>{
       location=data
        })
    products.find({subcategory:req.params.id}).then((data)=>{

     res.render('allproducts',{
      data:data,
      location:location
     })
    })

     })
    
     app.get('/allproducts/moreinfo/location/:id',(req,res)=> {
        products.find().then((data)=>{

         res.render('allproducts',{
          data:data,
          
         })
        })
         })

 app.get('/subcategory/',(req,res)=> {
     res.render('subcategory')
})

app.get('/alluserdata',(req,res)=>{
Userpref.find().then((data)=>{
    res.render('alluserdata',{
        data:data
    })
})
    
})

app.post('/subcategory/',(req,res)=> {
const {subcategory,subtitle,subitem}=req.body
var sub_category =new Subcategory({
    subtitle:subtitle,
    subitem:subitem,
    subcategory:subcategory
})    
sub_category.save((err,data)=>{
    console.log('data saved')
})
    
    res.render('subcategory')
})

 app.post('/edit-category/:id',(req,res)=> {
    var id=req.params.id
    Category.findById(req.params.id).then((data)=>{
      data.title=req.body.title
      data.item=req.body.item
      data.save((err,data)=>{
          if(err){
          }
          else{
             console.log('saved')
          }res.redirect('/allcategory')
      })

       })
     })
    

app.post('/searchproducts',(req,res)=>{
    products.find({category:req.body.search}).then((data)=>{
    res.render('allproducts',{
        data:data
    })
    })
})

     
app.get('/moreproducts/:id',(req,res)=>{
    var id=req.params.id
    products.findById(req.params.id).then((data)=>{
        arr.push(data)
        x = arr.filter((power, toThe, yellowVests) => yellowVests.map(updateDemocracy => updateDemocracy['item']).indexOf(power['item']) === toThe)
        res.render('moreproducts',{
        data:data

    })
    })  
})

     app.post('/edit-products/:id',upload.single('image'),(req,res)=> {
        var id=req.params.id
        Products.findById(req.params.id).then((data)=>{
          data.title=req.body.title
          data.item=req.body.item
          data.category=req.body.category
          data.desc=req.body.desc
          data.price=req.body.price
          data.ads=req.body.ads
          data.adsvalue=req.body.adsvalue
          data.location=req.body.location
          data.itemname=req.body.itemname
          data.image=req.file.filename
          data.save((err,data)=>{
              if(err){
                console.log('error',err)
              }
              else{
                 console.log('saved')
              }res.redirect('/allproducts')
          })
    
           })
    
         })

     app.get('/allcategory',(req,res)=> {
            var datacats
           Category.find().then((datacat)=>{
                datacats= datacat
             })
    Subcategory.find({subcategory:'car'}).then((data)=>{
     res.render('allcategory',{
        data:data,
        datacats:datacats
     })
    })
     })

app.post('/addproducts',upload.single('image'),bodyparser.urlencoded({extended:false}),(req,res)=> {
   const {title,item,desc,category,price,itemname,adsvalue,ads,subcategory,location}=req.body
   var products=new Products({
       title:title,
       item:item,
       itemname:itemname,
       desc:desc,
       category:category,
       price:price,
       ads:ads,
        adsvalue:adsvalue,
        location:location,
        subcategory:subcategory,
       image:req.file.filename
   })
   
   products.save()

  res.redirect('/addproducts')
})

app.get('/signup',(req,res)=> {
	res.render('signup')
})

app.post('/signup',async (req,res)=>{
    const{name,email,password}=req.body
        const emailvalue=name
        const passwordvalue=password
  
        try        {
            const data=res.json()
            console.log(data.errors)
           
        }catch(err)
        {
            const errors=handleerrors(err)
            res.status(400).json({err:errors})
        }

		const user=await new User({name,email,password,admin:'admin'})
		
		const token=createtoken(user._id)
		user.save().then((err,data)=>{
			if(err)
			{
				console.log(err)
			}
		
		})
		res.cookie('jwt',token,{httpOnly:true,maxage:maxage*1000})
		res.redirect('/login')

})
app.get('/login',(req,res)=>{

	res.render('login') 
})
app.post('/login',async(req,res)=>{
    const{email,password}=req.body
    req.checkBody('email','email is not valid').isEmail()
    req.checkBody('password','password is not correct').notEmpty()
	try{	const user=await User.login(email,password)
	const token=createtoken(user._id)
    res.cookie('jwt',token,{httpOnly:true,maxage:maxage*1000})
    req.flash('success_msg','you are now logged in')
	res.redirect('/home')
	}
	catch(err)
	{
        var errors=req.validationErrors()
        req.flash('error_msg','wrong username or password')
        res.render('login',{
            errors:errors
        })

	}
})
app.put('/:id',bodyparser.urlencoded({extended:false}),upload.single('image'),function(req,res) 
{
    Car.findOne({
        _id:req.params.id
    })
    .then(function(data){
        data.carmake=req.body.carmake,
        data.carmodel=req.body.carmodel, 
        data. yearofmanufacture=req.body.yearofmanufacture,
        data.mileage=req.body.mileage,
        data.engine=req.body.engine,
        data.transmission=req.body.transmission,
        data.color=req.body.color,
        data.price=req.body.price, 
        data.tdastalocation=req.body.location,
        data.description=req.body.description,
        data.condition=req.body.condition,       
        data.bodytype=req.body.bodytype,
        data.duty=req.body.duty,
        data.interior=req.body.interior, 
        data.airbag=req.body.airbag,
        data.electricmirrors=req.body.electricmirrors,
        data.tractioncontrol=req.body.tractioncontrol,
        data.airconditioning=req.body.airconditioning,
        data.powersteering=req.body.powersteering,
        data.amfmradio=req.body.amfmradio,
        data.frontfoglamps=req.body.frontfoglamps, 
        data.electricwindows=req.body.electricwindows,
        data.alloywheels=req.body.alloywheels,
        data.foglights=req.body.foglights,
        data.airconditioning=req.body.airconditioning,
        data.thumbstart=req.body.thumbstart,
        data.image=req.file.filename
        data.save()
        .then((updateddata)=>{
       res.redirect('/home')
        })
    })   
})
const items_per_page=12
app.get('/home/',requireauth,function(req,res) {
	const page=+(req.query.page||1) 
	var totalpage;
	Car.find().sort({sorting:1}).countDocuments().then(data=>{
	totalpage=data
	return Car.find().skip((page-1)*items_per_page)
	.limit(items_per_page)
	.then((data)=>{
			res.render('home',{
				data:data,				pagetitle:'shop',
				path:'/',
				currentpage:page,
				totalproducts:totalpage,
				hasnextpage:items_per_page*page<totalpage,
				haspreviouspage:page>1,
				nextpage:page+1,
				previuospage:page-1,
				lastpage:Math.ceil(totalpage/items_per_page)
	})
	})
})
})  

app.post('/addcars',upload.array('image',6),bodyparser.urlencoded({extended:false}),function(req ,res) {

    const newcar=new Car({
        carmake:req.body.carmake,
        carmodel:req.body.carmodel, 
        yearofmanufacture:req.body.yearofmanufacture,
        mileage:req.body.mileage,
        engine:req.body.engine,
        transmission: req.body.transmission,
        color:req.body.color,
        price:req.body.price, 
        location:req.body.location,
        description:req.body.description,
        condition:req.body.condition,
        bodytype: req.body.bodytype,
        duty:req.body.duty,
        interior:req.body.interior, 
        airbag:req.body.airbag,
        electricmirrors:req.body.electricmirrors,       
        tractioncontrol:req.body.tractioncontrol,
        airconditioning: req.body.airconditioning,
        powersteering:req.body.powersteering,
        amfmradio:req.body.amfmradio,
        frontfoglamps:req.body.frontfoglamps, 
        electricwindows:req.body.electricwindows,
        alloywheels:req.body.alloywheels,
        foglights:req.body.foglights,
        airconditioning: req.body.airconditioning,
        thumbstart:req.body.thumbstart,
        image:req.files
    })
    newcar.save()
  res.redirect('/home')
  })
  app.post('/guest/addcars',upload.single('image'),bodyparser.urlencoded({extended:false}),function(req ,res) {
    const guestnewcar=new Guestnewcar({
        carmake:req.body.carmake,
        carmodel:req.body.carmodel, 
        yearofmanufacture:req.body.yearofmanufacture,
        mileage:req.body.mileage,
        engine:req.body.engine,
        transmission: req.body.transmission,
        color:req.body.color,
        price:req.body.price, 
        location:req.body.location,
        description:req.body.description,
        condition:req.body.condition,
        bodytype: req.body.bodytype,
        duty:req.body.duty,
        interior:req.body.interior, 
        airbag:req.body.airbag,
        electricmirrors:req.body.electricmirrors,        
        tractioncontrol:req.body.tractioncontrol,
        airconditioning: req.body.airconditioning,
        powersteering:req.body.powersteering,
        amfmradio:req.body.amfmradio,
        frontfoglamps:req.body.frontfoglamps, 
        electricwindows:req.body.electricwindows,
        alloywheels:req.body.alloywheels,
        foglights:req.body.foglights,
        airconditioning: req.body.airconditioning,
        thumbstart:req.body.thumbstart,
        image:req.file.filename
    })
    guestnewcar.save()
   res.redirect('/home')
  })
app.listen(3000,function(req,res){
    console.log('connected to server')
})
}