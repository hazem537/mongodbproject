const express =require('express')
const bodyParser =require('body-parser')
const mongoose=require('mongoose')
let softDelete = require('mongoosejs-soft-delete');
const db_url="mongodb://localhost:27017/dbproj"

const app=express()

//student model
let student_schema=mongoose.Schema({
  name:String,
  age:Number,
  SSN:{type:Number,unique:true},
  tele:Number,
  learn:[mongoose.Schema.Types.ObjectId]
})
student_schema.plugin(softDelete)
let Student=mongoose.model("student",student_schema)
// --------------------------------------------- student  
// add new STUDENT
  app.post('/student',bodyParser.json({extended:true}),(req,res,next)=>{

    let new_student= new Student({
      name:req.body.name,
      tele:req.body.tele,
      age:req.body.age,
      SSN:req.body.SSN
    })
  new_student.save().then((result)=>{
    res.send(result)
  }).catch((err)=>{res.send("this data is already exist")})
})
app.post('/student-bulk',bodyParser.json({extended:true}),(req,res,next)=>{

  Student.insertMany(req.body.students,forceServerObjectId=true) .then(()=>{
    Student.find().then((result)=>{
      res.send(result)
    })
  })
})
// get all student
app.get('/students',bodyParser.json({extended:true}),(req,res,next)=>{
  Student.find((err,result)=>{
    res.send(result)
  })
  
})
// get student by name
app.get('/student',bodyParser.json({extended:true}),(req,res,next)=>{
  Student.findOne({name:req.body.name}).then((result)=>{
    res.send(result)
    }).catch(()=>{ res.send("no student has this name")})
  
})
//update student by name
app.put('/student',bodyParser.json({extended:true}),(req,res,next)=>{
    Student.findOne({name:req.body.name}).then((stu)=>{
      Student.updateOne({_id:stu._id},{age:req.body.age},{tele:req.body.tele},{SSN:req.body.SSN} ,(err,result)=>{
        Student.find((err,result)=>{
          res.send(result)
        })
      
      })
    }).catch(()=>{res.send("no student has this name")})


  
})
//delete student by name
app.delete('/student',bodyParser.json({extended:true}),(req,res,next)=>{
  Student.findOne({name:req.body.name}).then((stu)=>{
    Student.deleteOne({_id:stu._id}).then((err,result)=>{
    
      Student.find((err,result)=>{
        res.send(result)
      })
    })   

  }).catch(()=>{ res.send("no student with this name")})
 
})
//soft delete student
app.delete('/student-soft',bodyParser.json({extended:true}),(req,res,next)=>{
  Student.findOne({name:req.body.name}).then(()=>{
     Student.removeOne({ _id:stu._id },(err, result)=>{
      Student.find ((err,result)=>{
        res.send(result)
      })
      
  })})
  });

app.post('/add-course',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.findOne({name:req.body.coursename}).then((course)=>{
    Student.findOne({name:req.body.studentname}).then((stu)=>{
      Student.updateOne({_id:stu._id},{$push:{learn:course._id}}).then((result)=>{

        Student.find().then((result)=>{
          res.send(result)
        })

    })


  }).catch(()=>{res.send("no student has this name")})
    
}).catch((err)=>{ res.send("this course not exist")})})






app.get('/student-serach-aggreation',bodyParser.json({extended:true}),(req,res,next)=>{

  Student.aggregate([
    {
        '$lookup': {
            'from': 'courses', 
            'localField': 'learn', 
            'foreignField': '_id', 
            'as': 'course'
        }
    }, {
        '$match': {
            'name': req.body.name
        }
    }, {
        '$project': {
            '_id': 0, 
            'SSN': 0, 
            'deleted': 0, 
            '__v': 0
        }
    }, {
        '$unwind': {
            'path': '$course', 
            'includeArrayIndex': 'dont have', 
            'preserveNullAndEmptyArrays': true
        }
    }, {
        '$project': {
            'name': 1, 
            'age': 1, 
            'tele': 1, 
            'course': '$course.name', 
            'course code': '$course.code'
        }
    }
]).then((result)=>{
    res.send(result)
  
})})


  

//  -----------------------------------------------instructor 
//instructor modle
let instructor_schema = mongoose.Schema({
  name:String
,tele:Number,
  SSN:{type:Number,unique:true},
  teach:[mongoose.Schema.Types.ObjectId]
})
instructor_schema.plugin(softDelete)
let Instructor = mongoose.model("instructor",instructor_schema)


app.post('/instructor-bulk',bodyParser.json({extended:true}),(req,res,next)=>{

  Instructor.insertMany(req.body.instructors,forceServerObjectId=true) .then(()=>{
    Instructor.find().then((result)=>{
      res.send(result)
    })
  })
})

app.post('/instructor',bodyParser.json({extended:true}),(req,res,next)=>{
  let new_instructor= new Instructor({
    name:req.body.name,
    tele:req.body.tele,
    SSN:req.body.SSN
  })
  new_instructor.save().then((result)=>{
    res.send(result)
  }).catch((err)=>{res.send('this data is already used')})
// get all instructors
})
app.get('/instructors',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.find((err,result)=>{
    res.send(result)
  })
  
})
// get instructor by name
app.get('/instructor',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.findOne({name:req.body.instructorname}).then((result)=>{
    res.send(result)
  }).catch(()=>{res.send("no instructor has this name")})
  
})
//update instructor by name

app.put('/instructor',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.updateOne({name:req.body.name},{tele:req.body.tele},{SSN:req.body.SSN}, (err,result)=>{
    Instructor.find((err,result)=>{
      
      res.send(result)
    })
  
  })
})
//delete instrutor by name
app.delete('/instructor',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.findOne({name:req.body.name}).then((instructor)=>{
    Course.updateOne({teached:instructor._id},{teached:null}).then(()=>{
      Instructor.deleteOne({_id:instructor._id},(err,result)=>{
      
        Instructor.find().then((result)=>{
          res.send(result)
        })
      })

    })
   
  }).catch(()=>{res.send("no instructor has this name")})
 
})
//soft delete instructor
  app.delete('/instructor-soft',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.findOne({name:req.body.name},(err,result)=>{
    Instructor.removeOne({ _id:result._id },(err, result)=> {
      Instructor.find((err,result)=>{
        res.send(result)
      })
      
  })})
  });
  app.post('/teach-course',bodyParser.json({extended:true}),(req,res,next)=>{
    Course.findOne({name:req.body.coursename}).then((course)=>{
      Instructor.updateOne({name:req.body.instructorname},{$push:{teach:course._id}}).then(()=>{
       Instructor.findOne({name:req.body.instructorname}).then((result)=>{
         
         Course.updateOne({_id:course._id},{teached : result._id}).then(()=>{
          res.send(result)
         })
       
       }).catch(()=>{res.send("no instructor has this name")}) 
      
    }).catch(()=>{res.send("no instructor has this name")})
  }).catch(()=>{res.send("no course has this name")})
   });


   app.get('/instructor-search-aggreation',bodyParser.json({extended:true}),(req,res,next)=>{
  Instructor.aggregate([
    {
        '$lookup': {
            'from': 'courses', 
            'localField': 'teach', 
            'foreignField': '_id', 
            'as': 'courses'
        }
    }, {
        '$match': {
            'name': req.body.name
    }}, {
        '$unwind': {
            'path': '$courses', 
            'preserveNullAndEmptyArrays': false
        }
    }, {
        '$project': {
            '_id': 0, 
            'name': 1, 
            'tele': 1, 
            'courses': 1
        }
    }
]).then(result=>{res.send(result)})

   })
  
    

// ---------------------------------------------------Course----------- 
let course_schema = mongoose.Schema({
  name:String
,code:{type:String,unique:true},
 teached :{type:mongoose.Schema.Types.ObjectId,default:null,unique:true} 
})
course_schema.plugin(softDelete)
let Course = mongoose.model("course",course_schema)
 

app.post('/course-bulk',bodyParser.json({extended:true}),(req,res,next)=>{

  Course.insertMany(req.body.courses,forceServerObjectId=true) .then(()=>{
    Course.find().then((result)=>{
      res.send(result)
    })
  })
})

app.post('/course',bodyParser.json({extended:true}),(req,res,next)=>{
  let new_course = new Course({
    name:req.body.name,
    code:req.body.code
    
  })
  new_course.save((err,result)=>{
    res.send(result)
  })
// get all couese
})
app.get('/courses',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.find((err,result)=>{
    res.send(result)
  })
  
})
// get course by name
app.get('/course',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.find({name:req.body.name}).then(()=>{
    res.send(result)
  }).catch(()=>{res.send("no course has this name")})
  
})
//update course by name
app.put('/course',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.findOne({name:req.body.name}).then((course)=>{

    Course.updateOne({_id:course._id},{code:req.body.code}, (err,result)=>{
      Course.find((err,result)=>{
        
        res.send(result)
      })
    
    })

  }).catch(()=>{res.send("no course has this name")})
  
})
//delete course by name
app.delete('/course',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.findOne({name:req.body.name}).then((course)=>{

    Course.deleteOne({_id:course._id}).then(()=>{
      Course.find({}).then((result)=>{
        res.send(result)
      })
  })
  }).catch(()=>{res.send("this course not exist")})
 
})
//soft delete Course
app.delete('/course-soft',bodyParser.json({extended:true}),(req,res,next)=>{

  Course.findOne({name:req.body.name}).then((course)=>{
    Course.removeOne({ _id:course._id },(err, result)=> {
      Course.find((err,result)=>{
        res.send(result)
      })
      
  })}).catch(()=>{res.send("no course with this name")})
  });
  app.get('/course-search-aggreation',bodyParser.json({extended:true}),(req,res,next)=>{

    Course.aggregate([
      {
          '$lookup': {
              'from': 'instructors', 
              'localField': 'teached', 
              'foreignField': '_id', 
              'as': 'instr'
          }
      }, {
          '$lookup': {
              'from': 'students', 
              'localField': '_id', 
              'foreignField': 'learn', 
              'as': 'student'
          }
      }, {
          '$lookup': {
              'from': 'sections', 
              'localField': '_id', 
              'foreignField': 'course_id', 
              'as': 'section'
          }
      }, {
          '$match': {
              'name': req.body.name
          }
      }, {
          '$unwind': {
              'path': '$instr', 
              'includeArrayIndex': 'index', 
              'preserveNullAndEmptyArrays': false
          }
      }, {
          '$project': {
              '_id': 0, 
              'name': 1, 
              'code': 1, 
              'instructor name': '$instr.name', 
              'student': '$student', 
              'section': '$section'
          }
      }
  ]).then((result)=>{
      res.send(result)
    })
    
    })
  

  
//-----------------------------------------section model
let section_schema = mongoose.Schema({
  name:String
,number:Number,
course_id:{type:mongoose.Schema.Types.ObjectId,unique:true}
})
section_schema.plugin(softDelete)
let Section = mongoose.model("section",section_schema)
 

app.post('/section-bulk',bodyParser.json({extended:true}),(req,res,next)=>{

  Section.insertMany(req.body.sections,forceServerObjectId=true) .then(()=>{
    Section.find().then((result)=>{
      res.send(result)
    })
  })
})


app.post('/section',bodyParser.json({extended:true}),(req,res,next)=>{
  Course.findOne({name:req.body.coursename}).then((course)=>{
    let new_section= new Section({
      name:req.body.name,
      number:req.body.number,
      course_id:course._id
    })
    new_section.save().then((result)=>{
      res.send(result)
    }).catch((err)=>{res.send("this course has asection")})
  }).catch(()=>{res.send("no coursev has ths name")})
 
// get all couese
})
app.get('/sections',bodyParser.json({extended:true}),(req,res,next)=>{
  Section.find((err,result)=>{
    res.send(result)
  })
  
})
// get section by name
app.get('/section',bodyParser.json({extended:true}),(req,res,next)=>{
  Section.find({name:req.body.name},(err,result)=>{
    res.send(result)
  })
  
})
//update section by name
app.put('/section',bodyParser.json({extended:true}),(req,res,next)=>{
  Section.findone({name:areq.body.name}).then((section)=>{
    Section.updateOne({_id:section._id},{number:req.body.number}, (err,result)=>{
      Section.find((err,result)=>{
        
        res.send(result)
      })
    
    })

  }).catch(()=>{res.send("no section has this name")})

})
//delete section by name
app.delete('/section',bodyParser.json({extended:true}),(req,res,next)=>{
  Section.findone({name:areq.body.name}).then((section)=>{
  Section.deleteOne({name:req.body.name},(err,result)=>{
  
      res.send(result)
   
  })
}).catch(()=>{res.send("this no section with  this name")})
})
//soft delete section
app.delete('/section-soft',bodyParser.json({extended:true}),(req,res,next)=>{
  Section.findOne({name:req.body.name}).then((result)=>{
    Section.removeOne({ _id:result._id },(err, result)=> {
      Section.find((err,result)=>{
        res.send(result)
      })
      
  })}).catch(()=>{res.send("this is no section with this name")})
  });
app.get("/search-aggreate-section",bodyParser.json({extended:true}),(req,res,next)=>{
  Section.aggregate([
    {
        '$lookup': {
            'from': 'courses', 
            'localField': 'course_id', 
            'foreignField': '_id', 
            'as': 'course'
        }
    }, {
        '$match': {
            'name': req.body.name
        }
    }, {
        '$unwind': {
            'path': '$course', 
            'preserveNullAndEmptyArrays': false
        }
    }, {
        '$project': {
            '_id': 0, 
            'name': 1, 
            'number': 1, 
            'course': 1
        }
    }
]).then(result=>{
    res.send(result)
  })
})








  mongoose.connect(db_url).then(()=>{
  app.listen(3000,()=>{
  console.log("server is lisent to port 3000 ")
  })
  }).catch(err=>{
  console.log(err)
  })