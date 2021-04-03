
exports.postImage = async(req,res)=>{
   
        console.log(req.file)
        
         try{              
        
                res.status(201).send(            
                        {
                            message:"File uploaded successfully ",
                            imageUrl:  req.file.url
                        }
                   
                    )
            
            }catch(err){
                console.log(err)
                res.status(500).send({message:"Error while uploading file "})
            }
       
   
}