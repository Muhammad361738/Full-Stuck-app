import {z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "User nae must be at least 2 characters")
    .max(20, "user name must be 20 or less characters")
    .regex(/^[a-zA-Z0-9_]+$/,"User name must not contain any special characters")


    export const signUpSchema = z.object({
        username : usernameValidation,
        email : z.string().email({message: 'Invalid email address'}),
        password : z.string().min(6,{message: "password must be at least 6 characters"})
    })