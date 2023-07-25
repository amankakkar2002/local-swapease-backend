const jwt=require("jsonwebtoken");
const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const authenticate=require("../middleware/authenticate");
const fs = require("fs");
const path = require("path");
require('../db/conn');

const User=require('../models/userSchema');

const cookieParser = require("cookie-parser");
const Authenticate = require("../middleware/authenticate");
router.use(cookieParser());

router.get('/home',(req,res)=>
{
    res.send('Hello at 3000 from auth.js');
})

// router.post('/register', (req,res)=>
// {
//     const { name, email, phone, work, password, cpassword}=req.body;
//     if(!name|| !email|| !phone|| !work|| !password || !cpassword)
//     {
//         return res.status(422).json({error:"Either one or more fields are empty...."});
//     }

//     User.findOne({email:email})
//     .then((userExist)=>
//     {
//         if(userExist)
//         {
//             return res.status(422).json({error:"Email id already exists...."});
//         }
//         const user=new User( name, email, phone, work, password, cpassword);
//         user.save().then(()=>
//         {
//             res.status(201).json({message:"Registered successfully"});
//         }
//         ).catch((err)=>res.status(500).json({error:"Registration failed...."}));
//     }
//     ).catch(err=> {console.log(err); });
// })

router.post('/register', async(req,res)=>
{
    const { name, email, enrollment, sector, password, cpassword, course, branch, batch, year, esubject, dsubject}=req.body;
    if(!name|| !email|| !enrollment|| !sector|| !password || !cpassword)
    {
        return res.status(422).json({error:"Either one or more fields are empty...."});
    }
    try{
       const userExist= await User.findOne({email:email});
       if(userExist)
        {
            return res.status(422).json({error:"Email id already exists...."});
        }
        else if(password!=cpassword)
        {
            return res.status(422).json({error:"Password and confirm password didn't match...."});
        }
        else
        {
            const user=new User({ name, email, enrollment, sector, password, cpassword, course, branch, batch, year, esubject, dsubject});

            await user.save();
            res.status(201).json({message:"Registered successfully"});
        }
    }
    catch(err)
    {
        console.log(err);
    }
});

//login route

router.post('/signin',async (req,res)=>
{
    // console.log(req.body);
    // res.json({message:"Login Successful"});

    try
    {
        let token;
        const {email,password}=req.body;
        if(!email || !password)
        {
            return res.status(400).json({error:"Either one or more fields are empty...."});
        }
        const userLogin=await User.findOne({email:email});
        if(userLogin)
        {
            const isMatch=await bcrypt.compare(password,userLogin.password);
            token=await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken",token,{
            expires: new Date(Date.now()+ 25892000000),
            httpOnly:true
            });
            if(!isMatch)
            {
                res.status(400).json({error:"Invalid user credentials...."});
            }
            else{
                res.json({message:"Successful"});
            }
        }
        else
        {
            res.status(400).json({error:"Invalid user credentials...."}); 
        }
        
    }
    catch(err){
        console.log(err);
    }

}
)

// app.post("/submitDetails",authenticate, async (req, res) => {
//     const { email, password} = req.body;
  
//     const mentor = await User.find({
//       email: email,
//       password: password
//     });

//   // console.log(mentor);
//     mentor.map((val) => {
//       // // arr=[a,b,c,d]
//       // User.findOne({
//       //   email: val.email,
//       //  'mentors.email':email
//       // }).then((data) => {
//       //   if (!data)
//           User.findOneAndUpdate(
//             { email: val.email },
//             {  },
//             { new: true }
//           ).then((dat) => {});
//       // });
//     });
  
//     res.json({ msg: "success" });
//   });
// Apply form

router.post('/apply', Authenticate, async(req,res)=>
{
    try{
    const {email, course, branch, batch, year, esubject, dsubject}=req.body;
    // const email = req.user.email;
    if(!course|| !branch|| !batch|| !year|| !esubject || !dsubject)
    {
        return res.status(422).json({error:"Either one or more fields are empty...."});
    }
    const user = await User.findOne({email:email});
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    user.course = course;
    user.branch = branch;
    user.batch = batch;
    user.year = year;
    user.esubject = esubject;
    user.dsubject = dsubject;
    await user.save(); 
    res.status(201).json({message:"Applied successfully"});
    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post("/materials", (req, res) => {
    const { subject, year, exam } = req.body;
    const fileName = subject + year + exam + ".pdf";
    const filePath = path.join(__dirname, "../files/", fileName);
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

//Authentication of user for login

router.post('/contact', Authenticate, async (req,res)=>
{
    try
    { 
        const {name,email,enrollment,message}=req.body;
        if(!name||!email||!enrollment||!message)
        {
            console.log("Error in contact form");
            return res.json({error: "Please fill the form...."});
        }
        const userContact=await User.findOne({_id:req.userID});
        if(userContact)
        {
            const userMessage=await userContact.addMessage(name,email,enrollment,message);
            await userContact.save();
            res.status(201).json({message:"Message sent...."});
        }

    }catch(err)
    {
        console.log(err);
    }
})
router.get('/details', authenticate,(req,res)=>
{
    res.send(req.rootUser);
})
router.get('/applyform', authenticate,(req,res)=>
{
    res.send(req.rootUser);
})
router.get('/getdata', authenticate,(req,res)=>
{
    res.send(req.rootUser);
})

router.get('/logout',authenticate,(req,res)=>
{
    console.log('About us');
    res.clearCookie('jwtoken',{path:'/'})
    res.status(200).send(req.rootUser);
})

module.exports=router;