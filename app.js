
const express=require('express')
const RESET_PASSWORD_KEY='accountactivatekey123456'
const account_activation='accountactivatekey123456'
const DOMAIN = "sandbox0b97a7f64ee0419dbc5dd9e12d5a8e4c.mailgun.org";
var mailgun = require('mailgun-js')({apiKey: '8112c491df43c84299af1ced566b93fe-aff8aa95-5f700d0c', domain: DOMAIN});
var bodyparser=require('body-parser')
const load_ash=require('lodash')
const cors=require('cors')
const app=express()
var path=require('path')

app.use(express.static(path.join(__dirname,'public')))
app.use(cors())
const jwt=require('jsonwebtoken')
const {checkuser,requireauth,isadmin,handleerrors}=require('./auth/auth')
const passport=require('passport')
app.use(passport.initialize())
app.use(passport.session())
const mongoose=require('mongoose')
const CLIENT_URL='http://localhost:3000'
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

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);

const override=require('method-override')
const expresslayouts=require('express-ejs-layouts')
const bcrypt=require('bcrypt')
var cookieparser=require('cookie-parser')
var bodyparser=require('body-parser')
var ejs=require('ejs')
var flash=require('connect-flash')
var session=require('express-session')
var methodOverride=require('method-override')
const expressvalidator = require('express-validator')
app.use(methodOverride('_method'))
const multer=require('multer')
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine','ejs')

mongoose.connect('mongodb://localhost/loginapp',{useNewUrlParser:true,useUnifiedTopology:true})
app.use(require('express-session')({
    secret:'sdsddssecret',saveUninitialized:true,
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
const { request } = require('http')
app.use(index)
app.use('/guest/addcars',index)
app.use('/morelistings/:id',index)
app.use('/signup',index)
app.use('/editpage/:id',index)

app.put('/forgot-password',function(req,res,next){
const {email}=req.body
User.findOne({email},function(err,data){
    if(err){
        return res.status(400).json({error:'user with this email doesn\'t exist'})
    }
const token=jwt.sign({_id:User._id},RESET_PASSWORD_KEY,{expiresIn:'10m'})
const emailresetdata={
    from:'noreply@ronserK.com',
    to:email,
    subject:'Account Activation Link',
    html:`<h2>Please click the link below to reset your password</h2>
        <p>${CLIENT_URL}/resetpassword/${token}</p>
    `
    }
    return User.updateOne({resetlink:token},function(err,success){

        if(err){
            return res.status(400).json({err:'reset password link'})
        }
        else{
            mailgun.messages().send(emailresetdata,function(err,data){

                if(err){
                    return res.json({
                        error:err.message
                    })

                }
                //return res.json({message:'email has been sent,kindly check your mail'})
                    return  User.find({resetlink:token}).then((data)=>{
                     res.render('passwordreset',{
                     data:token
                              })
              
                             })
            })
       
            }
    })

})
})
const items_per_page=36
app.use(function(req,res,next){
res.locals.success_msg=req.flash('success_msg')
res.locals.error_msg=req.flash('error_msg')
res.locals.error=req.flash('error')
res.locals.tracks=req.session.tracksdata
next()
})

app.get('/',requireauth,function(req,res) {
	const page=+(req.query.page||1) 
	var totalpage;
	Car.find().sort({sorting:1}).countDocuments().then(data=>{
	totalpage=data
	return Car.find().skip((page-1)*items_per_page)
	.limit(items_per_page)
	.then((data)=>{
			res.render('home',{
				data:data,pagetitle:'shop',
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
app.get('/home',function(req,res){
res.render('home')
})

app.get('/forgotpassword',function(req,res,next){
res.render('forgot_password')
})
app.get('/resetpassword/:id',function(req,res,next){
    var id=req.params.id
res.render('passwordreset',{
    data:id
})
})
app.put('/reset-password',function(req,res,next){
const{resetlink,newpass}=req.body
if(resetlink){
jwt.verify(resetlink,RESET_PASSWORD_KEY,function(err,data){
    if(err){
        return res.status(401).json({
            error:'Incorrent token or expired Link'
        })
    }
    User.findOne({resetlink},(err,user)=>{
     
        if(err||!user){
            return res.status(400).json({error:'user with this token does not exist'})
        
        }
        const obj={
            password:newpass,
            resetlink:''
        }
        user=load_ash.extend(user,obj)
        user.save((err,result)=>{
            if(err){
                return res.status(400).json({error:'reset password'})
            }
            else{
              //  return res.status(200).json({message:'your password has been changed'})
              console.log('your password has been changed')
                res.redirect('/login')
            }

        })

    })



})
}
else{
     return res.status(401).json({error:'Auth Error!!'});
}
})
app.get('/admin/users/addcars',function(req,res,next) {
    res.render('addcars')
 })

var arr=[]
var x=[];

 const maxage=3*24*60*60
 const createtoken=(id)=>{
     return jwt.sign({id},'secret',{
         expiresIn:maxage
     })
 }

const storage=multer.diskStorage({
	destination:'./carwebsite/public/uploads/images',
    filename:function (req,file,callback) {
    callback(null,file.filename+'-'+Date.now()+path.extname(file.originalname))},
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
    var search=req.body.search
    Car.find({carmake:{$regex:search,$options:"$i"}}).then((data)=>{
    
        res.render('searchpage',{
            data:data
        })
    })
})
app.post('/multisearch',bodyparser.urlencoded({extended:false}),function(req,res){
    var carmake=(req.body.carmake)
    var model=(req.body.model)
    var price=(req.body.price)
    Car.aggregate([
        {$match:{$and:[{carmake:carmake},{carmodel:model},{price: {$gte: 501, $lte: 100000}}]}}

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

        })   
  
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
var subdatainfo
app.get('/allproducts/:id',(req,res)=> {
    var subdatainfo=req.params.id
products.find({category:req.params.id}).then((data)=>{
 res.render('allproducts',{
   subcategory:data,
   subinfo:subdatainfo
 })
})
 })

 app.get('/allproducts/moreinfo/:id',(req,res)=> {
    var location
    var datainfo=req.params.id
    products.find().then((data)=>{
       location=data
        })
    products.find({subcategory:req.params.id}).then((data)=>{

     res.render('allproducts',{
      data:data,
      location:location,
        moreinfo:datainfo,
        subdatainfo:data,
        locationinfo:data
    })
    })
     })
     app.get('/allproducts/location/:id',(req,res)=> {
        var location
        var datainfo=req.params.id
      
         res.render('allproducts',{
            locationinfo:data
  
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

app.get('/delete/:id',(req,res)=>{
Car.findOneAndDelete({_id:req.params.id}).then((data)=>{
        res.redirect('/home')
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
app.post('/signup',function(req,res,next){
const {email,name,password}=req.body

    User.findOne({email}).exec((err,user)=>{
        if(user){
         
            return res.status(400).json({error:'user with email already exists'})
        }
const token=jwt.sign({name,email,password},account_activation,{expiresIn:'10m'})
const data={
    from:'ronser@roserk.com',
    to:email,
    subject:'account activation link',
    html:`please click on given link your account ${CLIENT_URL}/activate/${token}>click to activate your acc</a>`
}
mailgun.messages().send(data,function(err,body){
console.log(body)
})
let newuser=new User({name,email,password})
newuser.save((err,success)=>{
	
	if(err){
		console.log('err in signup',err)
		return res.status(400),json({error:err})
	}
	res.json({message:'signup success!'})
	res.redirect('/login')
})

    })
})

app.get('/activate/:id',function(req,res,next){
    const data=req.params.id
res.render('emailactivate',{
    data:data
})

})
app.post('/activeaccount',function(req,res,next){

    const {token}=req.body
    if(token){
            jwt.verify(token,account_activation,function(err,decodedtoken){
                if(err){
                    return res.status(400).json({error:'incorrect or expired link'})
                }
                else{

                    const{name,email,password}=decodedtoken
             
                    User.findOne({email}).exec((err,user)=>{
                        if(user){
                         
                            return res.status(400).json({error:'user with email already exists'})
                        }

                        let newuser=new User({name,email,password,admin:'admin'})
                      
                 const token=createtoken(newuser._id)
                        newuser.save(function(err,succ){
                            if(err){
                                console.log('err signup while acc activation','err')
                                return res.status(400).json({error:'err activating account'})
                            }
                        
                              res.cookie('jwt',token,{httpOnly:true,maxage:maxage*1000})
                          res.redirect('/login')
                
                        })

                })

                }

            })
    }
    else{
        res.json({'err':'something went wromg'}) 
    }
})

/*
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
*/
app.get('/login',(req,res)=>{

	res.render('login') 
})

app.post('/login',async(req,res)=>{
    const{email,password}=req.body
   
    req.checkBody('email','email is not valid').isEmail()
    req.checkBody('password','password is not correct').notEmpty()

	try{
        
    const user=await User.login(email,password)
	const token=createtoken(user._id)

    res.cookie('jwt',token,{httpOnly:true,maxage:maxage*1000})
   // req.flash('success_msg','you are now logged in')
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

app.put('/:id',bodyparser.urlencoded({extended:false}),function(req,res) 
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
        data.location=req.body.location,
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
        data.thumbstart=req.body.thumbstart
        data.save()
        .then((updateddata)=>{
       res.render('home')
        })
    })   
})

  

app.post('/addcars',upload.array('image',12),bodyparser.urlencoded({extended:false}),function(req ,res) {
 
/*
    req.checkBody('carmake','carmake is not valid').notEmpty()
    req.checkBody('carmodel','carmodel is not correct').notEmpty()
    req.checkBody('yearofmanufacture','email is not valid').notEmpty()
    req.checkBody('mileage','mileage is not correct').notEmpty()
    req.checkBody('engine','engine is not valid').notEmpty()
    req.checkBody('transmission','transmission is not correct').notEmpty()
    req.checkBody('color','color is not valid').notEmpty()
    req.checkBody('price','price is not correct').notEmpty()
    req.checkBody('location','location is not valid').notEmpty()
    req.checkBody('description','description is not correct').notEmpty()
    req.checkBody('condition','condition is not valid').notEmpty()
    req.checkBody('bodytype','bodytype is not correct').notEmpty()
    req.checkBody('duty','duty is not valid').notEmpty()
    req.checkBody('interior','interior is not correct').notEmpty()
*/
    var errors=req.validationErrors()

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


app.listen(process.env.PORT|| 4000,function(req,res){
    console.log('connected to server')
})
}
