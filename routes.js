const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const car=require('./models/carmodels')
const Car=mongoose.model('cartable')
const {requireauth,isadmin}=require('./auth/auth')
const { database } = require('faker/locale/az')
var morelistingsdata;
 router.delete(':/id',requireauth,(req,res)=>{
	Car.remove({_id:req.params.id})
	.then(()=>{
		res.redirect('/home')
    })
})
router.get('/guest/addcars',function(req,res) {
    res.render('sell')
  })
  router.get('/morelistings',function(req,res) {
  })

router.get('/morelistings/:id',function(req,res,next) {

  Car.find().then((data)=>{ 
 morelistingsdata=(data) 
  } )
  Car.findOne({_id:req.params.id})
    .then((data)=>{
    
          res.render('morelistings',{
              data:data,
              morelistingsdata:morelistingsdata
          })
    })
     })

router.get('/signup',function(req,res) {
    res.render('register')
  }) 


router.get('/editpage/:id',requireauth, function (req,res) {
          Car.findOne({
              _id:req.params.id
          }).then(data=>{
               res.render('editpage',{
                  data:data
              })
          }) 
})
router.get('/logout',(req,res)=>{
	res.cookie('jwt','',{maxage:1})    
	res.redirect('/login')
})
module.exports=router
