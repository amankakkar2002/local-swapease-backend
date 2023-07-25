const DB=process.env.DATABASE;
const mongoose=require('mongoose');

mongoose.connect(DB).then(()=>{
    console.log("DB Connected");
}).catch((err)=> console.log(err));