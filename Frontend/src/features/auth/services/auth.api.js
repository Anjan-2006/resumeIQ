import axios from 'axios'
import { API_BASE_URL } from '../../../config/api'

const api=axios.create({
     baseURL:`${API_BASE_URL}/api/auth`,
      withCredentials:true
})


export async function register({username,email,password}){
       
      try{
           const response=await api.post('/register',
            { username,email,password },
           )

           return response.data
      }
      catch(err){
          console.log(err)
            throw err
      }

}

export async function login({email,password}){
       try{
           const response=await api.post('/login',{email,password})
            
           return response.data
        }
       catch(err){
            console.log(err)
            throw err
       }
}

export async function guestLogin(){
        try{
             const response=await api.post('/guest-login')
             return response.data
        }
        catch(err){
               console.log(err)
               throw err
        }
}

export async function logout(){
       try{
            const response=await api.get("/logout")
            return response.data
        }
       catch(err){
            console.log(err)
            throw err
       }
}


export async function getMe(){
       try{
            const response=await api.get("/getme")
            return response.data
        }
       catch(err){
            console.log(err)
            throw err
       }
}

