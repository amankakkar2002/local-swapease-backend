const dotenv=require("dotenv");
const mongoose=require('mongoose');
const express=require('express');
const app=express();

dotenv.config({path: './config.env'});

const User=require('./models/userSchema');

require('./db/conn.js');
app.use(express.json());

// to link the router file to route the path easily
app.use(require('./router/auth'));

const PORT=process.env.PORT;

//Middleware

// const middleware=(req,res,next)=>
// {
//     console.log("Hello, I am middleware");
//     next();
// }

// app.get('/home',(req,res)=>
// {
//     res.send('Hello at 3000');
// })

// app.get('/login',(req,res)=>
// {
//     res.send('Hello at login');
// })

app.get('/signup',(req,res)=>
{
    res.send('Hello at signup');
})



app.listen(PORT,()=>
{
    console.log(`running at port number ${PORT}`);
})

//To show details (Available)

app.get('/AllUser',async(req,res)=>
{
    try{
        const allUser = await User.find({'course':{$not:{$regex:'N/A'}}});
        res.send({status: "ok", data: allUser});
    }catch(error){
        console.log(error);
    }
})

app.get('/messages', (req, res) => {
    User.find({ "messages": { "$not": { "$size": 0 } } })
      .then(users => {
        const messages = users.map(user => user.messages.map(m => ({ name: m.name, enrollment: m.enrollment, email: m.email, message: m.message })));
        res.send({ messages });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal server error');
      });
  });
  app.post('/deleteFormDetails', async (req, res) => {
    const userId = req.body.userId; // Assuming the frontend will send the user ID to identify the user
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
  
      // Set the specified fields to "N/A"
      user.course = "N/A";
      user.branch = "N/A";
      user.batch = "N/A";
      user.year = "N/A";
      user.dsubject = "N/A";
      user.esubject = "N/A";
  
      // Save the updated user data to the database
      await user.save();
  
      res.send({ status: "ok", message: "Form details deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

app.post('/clearForms', async (req, res) => {
  try {
    await User.updateMany({}, {
      course: "N/A",
      branch: "N/A",
      batch: "N/A",
      year: "N/A",
      dsubject: "N/A",
      esubject: "N/A"
    });

    res.send({ status: "ok", message: "Form details cleared successfully for all users" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

  app.post('/clearDatabase', async (req, res) => {
    try {
      // Delete all documents in the 'users' collection (change 'users' to your actual collection name)
      await User.deleteMany({ email: { $ne: "swapeasenow@gmail.com" } });  
      res.send({ status: "ok", message: "Database cleared successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  
  app.delete('/messages/:name', (req, res) => {
    const name = req.params.name;
    User.updateOne({ "messages.name": name }, { "$pull": { "messages": { "name": name } } })
      .then(result => {
        console.log(result);
        res.send({ success: true });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal server error');
      });
  });  