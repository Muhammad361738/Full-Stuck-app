import {dbConnect} from "@/lib/dbConnect"
import UserModel from "@/model/User"
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"
import { string } from "zod"

export async function POST(request : Request){
    await dbConnect ()
    try {
        const {username, email , password} = await request.json()

        const existUserVerifiedByUserName = await UserModel.findOne ({
            username ,
            isVerified: true
        })

        if (existUserVerifiedByUserName){
            return Response.json({
                success : false,
                message : "User name is already taken"
            },{status : 400})
        }

        const existingUserEmail = await UserModel.findOne({email})
        const verifyCode  = Math.floor(100000 + Math.random() * 900000).toString()
        if (existingUserEmail) {
            if (existingUserEmail.isVerified){

                return Response.json(
                    {
                        success : false ,
                        message : "User Already Exist with this Email "
                    },{
                        status : 400
                    }
                )

            } else {
                const hasedPassword = await bcrypt.hash (password , 10)
                existingUserEmail.password = hasedPassword;
                existingUserEmail.verifyCode = verifyCode
                existingUserEmail.verifycodeExpiry = new Date(Date.now() +3600000)
                await existingUserEmail.save()
            }
        } else {
            const hasedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date ()
            expiryDate.setHours(expiryDate.getHours()+1)

          const newUser =  new UserModel ({
                username ,
                   email ,
                   password : hasedPassword,
                   verifyCode ,
                   verifycodeExpiry : expiryDate,
                   isVerified : false,
                   isAcceptingmessage : true,
                   messages : []
                
            })
            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,verifyCode
        )
        if (!emailResponse.success){
            return Response.json(
                {
                    success : false,
                    message : emailResponse.message
                },{status : 500}
            )
        }

        return Response.json(
            {
                success : true,
                message : "User Register successfully . Please verify your email "
            },{status : 201}
        )
        
    } catch (error) {
        console.log("Error registaring user ", error )
    return Response.json(
        {
            success : false ,
            message : "Error Regestring user"
        },{
            status : 500
        }
    )        
    }
}