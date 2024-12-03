'use strict'
var Project = require('../models/project');
var fs = require('fs');

var controller = {
    home: function(req, res){
        return res.status(200).send({
            message: 'Soy home'
        })
    },
    test: function(req, res){
        return res.status(200).send({
            message: 'Soy el metodo o accion test del controlador'
        });
    },

    saveProject: async function(req, res){
        var project = new Project();
        var params = req.body;
        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.year = params.year;
        project.langs = params.langs;
        project.image = null;

        project.save().then((err, projectStored) => {
            if(err) return res.status(500).json({
                message: 'Error al guardar documento.'
            });
            if(!projectStored) return res.status(404).json({
                message: 'No se ha podido guardar documento.'
            });

            return res.status(200).send({
                project: projectStored
            });
        });


        return res.status(200).send({
            project: project,
            message: "Metodo saveProject"
        });
    },

    getProject: async function (req, res) {
        var projectId = req.params.id;
      
        if (projectId == null) return res.status(404).json({
            status: "error",
            message: "El proyecto no existe"});
      
        try {
          const project = await Project.findById(projectId);
          
          if (!project) return res.status(404).json({
            status: "error",
            message: "El proyecto no existe"
        });
          return res.status(200).send({project});
        } catch (err) {
          return res.status(500).send({message: "Error al devolver los datos"});
        }
      }, 

    getProjects: async function(req, res){

        // try{
        //     project.find().then((projects) => {
        //         return res.status(200).send({projects})
        //     })
        // } catch (err) {
        //     return res.status(404).send({
        //         message: 'Error'
        //     });
        // }
        Project.find({}).sort('-year').then((projects) => {
            
            if(!projects) return res.status(404).send({message: 'No hay projectos para mostrar.'});

            return res.status(200).send({projects});
        }).catch((err) => {
            if(err) return res.status(500).send({
                message: 'Error al devolver datos'
            });
        })
    },

    updateProject: function(req, res){
        var projectId = req.params.id;
        var update = req.body;

        Project.findByIdAndUpdate(projectId, update, {new:true})
        .then((projectUpdated)=>{
            return res.status(200).send({
                project: projectUpdated
            })
        })
        .catch(() => {
            return res.status(404).send({message: "Proyecto no encontrado para actualizar."});
        });
    },

    deleteProject: function(req, res){
        var projectId = req.params.id;

            Project.findByIdAndDelete(projectId)
            .then((projectRemoved) => {
                return res.status(200).send({
                    project: projectRemoved
                })
            })
            .catch((err, projectRemoved) =>{
                if(err) return res.status(500).send({message: 'No se pudo eliminar el proyecto.'});
     
                if(!projectRemoved) return res.status(404).send({message: 'No se pudo encontrar el proyecto para ser eliminado.'});
            });
        },

        uploadImage: async function (req, res) {
            try {
                var projectId = req.params.id;
                var fileName = 'Imagen no subida';
     
                if (req.files && req.files.image) {
                    var filePath = req.files.image.path;
                    var fileSplit = filePath.split('\\');
                    var fileNameNew = fileSplit[1];
                    var extSplit = fileNameNew.split('\.');
                    var fileExt = extSplit[1];
                    /*
                    var fileExt = extSplit[1];
                    fileExt = fileExt.toLowerCase();
                    */
     
                    if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
     
                        var updateImage = await Project.findByIdAndUpdate(
                            projectId,
                            { image: fileNameNew },
                            { new: true }
                        );
     
                        if (updateImage) {
                            return res.status(200).send({
                                files: fileNameNew,
                                message: 'El archivo se ha subido con éxito'
                            });
                        } else {
                            return res.status(404).send({
                                message: 'No se ha encontrado el proyecto'
                            });
                        }
                    } else {
                        fs.unlink(filePath, (err) => {
                            return res.status(200).send({ message: "La extension no es valida" })
                        })
                    }
     
                } else {
                    return res.status(200).send({
                        message: fileName
                    });
                }
            } catch (err) {
                return res.status(500).send({ message: 'Error al llamar al método uploadImage' });
            }
        }
    }


module.exports = controller;