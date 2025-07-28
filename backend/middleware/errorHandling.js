const errorHandler=(err,req,res,next)=>{
    const statusCode=res.statusCode?res.statusCode:500;
    switch(statusCode){
        case 400:
            res.json({title:"bad request",
                message:"invalid data",
                stackTrace: err.stack,
            });
            break;
        case 401:
            res.json({title:"unauthorized",
                message:"no token or invalid token",
                stackTrace: err.stack,
            })
            break;
        case 403:
            res.json({title:"forbidden",
                message:"user doesnt have permission",
                stackTrace: err.stack,
            })
            break;
        case 409:
            res.json({title:"conflict",
                message:"user already exists",
                stackTrace: err.stack,
            })
            break;
        default:
            res.json({message:"unknown error statuscode unknown",
                stackTrace:err.stack
            });
            break;
    }
}
module.exports=errorHandler;