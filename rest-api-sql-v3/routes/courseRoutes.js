'use strict';

const express = require('express');
const { authenticateUser } = require('../middleware/auth-user');

const { Course } = require('../models');
const { User } = require('../models');

// Construct a router instance.
const router = express.Router();

//middlware async function
function asyncHandler(cb){
    return async (req, res, next)=>{
      try {
        await cb(req,res, next);
      } catch(err){
        next(err);
      }
    };
  }

//Send a GET request to return a list of courses
router.get('/', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: "owner"
            }
        ]
    });
  if(courses){
    res.json(courses); 
    res.status(200); 
  } else {
    res.status(404).json({ message: "Courses not found." });
  }
  }));
  
  //Send a GET  request to get a specific course
router.get('/:id', asyncHandler(async (req, res) => {
      const course = await Course.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "owner"
          }
        ]
      });
      if (course) {
        res.json(course);
        res.status(200);
      } else {
        res.status(404).json({ message: "Hmm, we couldn't find that course." });
      }
    })
  );

//Send a POST request to create a new course
router.post('/', authenticateUser, asyncHandler( async (req, res) => {
    try{
        const course = await Course.create(req.body);
        res.status(201).location('api/courses' + course.id).end();
        } catch {
        res.status(400).json({message: 'Please provide course information.'});
    }
}));

//Send a PUT request to update a specific course
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findByPK(req.params.id);
        if(course){
            course.update = req.body;
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(404).json({message: "Oops! That page does not exist"});
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

//Send a DELETE request to delete a course
router.delete('/:id', asyncHandler (async(req, res) => {
        const course = await Course.findByPK(req.params.id);
    if(course) {
        await course.destroy(req.body);
        res.status(204).end();
    } else {
        res.status(404).json({message: "Hmm sorry, we can't find that course."});
    }
    })
);

module.exports = router;